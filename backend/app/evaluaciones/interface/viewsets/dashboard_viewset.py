from rest_framework import viewsets, response, decorators
from django.db.models import Avg, Count, Q
from academico.models import Semestre
from usuarios.models import Docente
from evaluaciones.models import EvaluacionConsolidada, CriterioEvaluacion

class DashboardViewSet(viewsets.ViewSet):
    """
    ViewSet para obtener estadísticas consolidadas para el Dashboard.
    """
    
    @decorators.action(detail=False, methods=['get'])
    def estadisticas(self, request):
        semestre_activo = Semestre.objects.filter(activo_para_carga=True).first()
        if not semestre_activo:
            return response.Response({
                "total_docentes": 0,
                "promedio_general": 0,
                "docentes_riesgo": 0,
                "progreso_evaluacion": "0%"
            })

        # Total docentes
        total_docentes = Docente.objects.count()

        # Intentamos obtener promedio desde consolidados "Total"
        promedio_general = EvaluacionConsolidada.objects.filter(
            semestre=semestre_activo,
            criterio__isnull=True
        ).aggregate(Avg('puntaje_final'))['puntaje_final__avg']

        # Si no hay consolidados, calculamos el promedio de todos los cursos del semestre
        if promedio_general is None:
            from evaluaciones.models import EvaluacionCurso
            promedio_general = EvaluacionCurso.objects.filter(
                curso_dado__semestre=semestre_activo
            ).aggregate(Avg('puntaje_curso'))['puntaje_curso__avg'] or 0

        # Normalizar base 100 a base 10 si es necesario
        if promedio_general > 10.1:
            promedio_general = promedio_general / 10

        # Docentes en Riesgo (punteo < 6 o < 60)
        # Priorizamos consolidados
        docentes_con_consolidado = EvaluacionConsolidada.objects.filter(
            semestre=semestre_activo,
            criterio__isnull=True
        )
        
        if docentes_con_consolidado.exists():
            docentes_riesgo = docentes_con_consolidado.filter(puntaje_final__lt=6).count()
            docentes_con_nota = docentes_con_consolidado.count()
        else:
            # Si no hay consolidados, usamos promedios de cursos por docente
            docentes_con_notas_cursos = Docente.objects.annotate(
                avg_punteo=Avg('asignaciones__evaluacioncurso__puntaje_curso', filter=Q(asignaciones__semestre=semestre_activo))
            ).filter(avg_punteo__isnull=False)
            
            docentes_riesgo = docentes_con_notas_cursos.filter(
                Q(avg_punteo__lt=6) | Q(avg_punteo__lt=60, avg_punteo__gt=10)
            ).count()
            docentes_con_nota = docentes_con_notas_cursos.count()

        progreso = f"{(docentes_con_nota / total_docentes * 100):.0f}%" if total_docentes > 0 else "0%"

        return response.Response({
            "total_docentes": total_docentes,
            "promedio_general": round(promedio_general, 1),
            "docentes_riesgo": docentes_riesgo,
            "progreso_evaluacion": progreso
        })

    @decorators.action(detail=False, methods=['get'])
    def promedios_criterios(self, request):
        semestre_activo = Semestre.objects.filter(activo_para_carga=True).first()
        if not semestre_activo:
            return response.Response([])

        # Mapeo de nombres largos (BD) a nombres cortos (Dashboard)
        mapping = {
            'Evaluaciones Estudiantes': 'Estudiantil',
            'Capacitaciones CEAT':       'CEAT',
            'Autoevaluaciones':          'Autoevaluación',
            'Control Docente':           'Coordinador',
            'Criterios de Coordinador':  'Coordinador',
            'Checklist':                 'visitas',
            'Apoyo y Colaboración':      'Apoyo'
        }

        data_map = {}

        # 1. Obtener promedios desde EvaluacionConsolidada (Criterios Globales)
        promedios_consolidados = EvaluacionConsolidada.objects.filter(
            semestre=semestre_activo,
            criterio__isnull=False
        ).values('criterio__nombre').annotate(valor=Avg('puntaje_final'))

        for p in promedios_consolidados:
            nombre_bd = p['criterio__nombre']
            if nombre_bd in mapping:
                val = p['valor'] or 0
                if val > 10.1: val = val / 10
                data_map[mapping[nombre_bd]] = round(val, 1)

        # 2. Obtener promedios desde EvaluacionCurso (Criterios por Curso)
        from evaluaciones.models import EvaluacionCurso
        promedios_cursos = EvaluacionCurso.objects.filter(
            curso_dado__semestre=semestre_activo
        ).values('criterio__nombre').annotate(valor=Avg('puntaje_curso'))

        for p in promedios_cursos:
            nombre_bd = p['criterio__nombre']
            if nombre_bd in mapping:
                val = p['valor'] or 0
                if val > 10.1: val = val / 10
                # Aquí simplemente nos aseguramos de que ambos se sumen al mapa
                data_map[mapping[nombre_bd]] = round(val, 1)

        # Convertir el mapa a la lista final
        final_data = [{"name": name, "valor": val} for name, val in data_map.items()]
            
        return response.Response(final_data)

    @decorators.action(detail=False, methods=['get'])
    def distribucion_rendimiento(self, request):
        semestre_activo = Semestre.objects.filter(activo_para_carga=True).first()
        if not semestre_activo:
            return response.Response([])

        # Intentamos obtener desde consolidados
        consolidados = EvaluacionConsolidada.objects.filter(
            semestre=semestre_activo,
            criterio__isnull=True
        )

        if consolidados.exists():
            excelente = consolidados.filter(puntaje_final__gte=8).count()
            buena = consolidados.filter(puntaje_final__gte=6, puntaje_final__lt=8).count()
            deficiente = consolidados.filter(puntaje_final__lt=6).count()
        else:
            # Usamos promedios de cursos por docente
            stats = Docente.objects.annotate(
                avg_punteo=Avg('asignaciones__evaluacioncurso__puntaje_curso', filter=Q(asignaciones__semestre=semestre_activo))
            ).filter(avg_punteo__isnull=False)
            
            # Manejamos escala 10 y escala 100
            excelente = stats.filter(Q(avg_punteo__gte=80) | Q(avg_punteo__gte=8, avg_punteo__lte=10)).count()
            buena = stats.filter(
                (Q(avg_punteo__gte=60) & Q(avg_punteo__lt=80)) | 
                (Q(avg_punteo__gte=6) & Q(avg_punteo__lt=8))
            ).count()
            deficiente = stats.filter(Q(avg_punteo__lt=60) | Q(avg_punteo__lt=6, avg_punteo__gt=0)).count()

        data = [
            {"name": "Excelente", "value": excelente, "color": "#10B981"},
            {"name": "Buena", "value": buena, "color": "#F59E0B"},
            {"name": "Deficiente", "value": deficiente, "color": "#EF4444"},
        ]
        return response.Response(data)
