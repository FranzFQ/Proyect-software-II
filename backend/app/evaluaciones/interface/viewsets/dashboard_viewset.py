from rest_framework import viewsets, response, decorators
from django.db.models import Avg, Count, Q, OuterRef, Subquery
from academico.models import Semestre
from usuarios.models import Docente
from evaluaciones.models import (
    EvaluacionConsolidada, 
    CriterioEvaluacion, 
    EvaluacionCurso, 
    ChecklistObservation,
    ConfiguracionPonderacion
)

class DashboardViewSet(viewsets.ViewSet):
    """
    ViewSet para obtener estadísticas consolidadas para el Dashboard.
    """

    @decorators.action(detail=False, methods=['get'])
    def resumen(self, request):
        semestre_activo = Semestre.objects.filter(activo_para_carga=True).first()
        if not semestre_activo:
            return response.Response({
                "stats": {"total_docentes": 0, "promedio_general": 0, "docentes_riesgo": 0, "progreso_evaluacion": "0%"},
                "data_promedios": [],
                "distribution_data": [],
                "top_docentes": [],
                "data_ponderaciones": []
            })

        # --- 1. DATOS BASE ---
        total_docentes = Docente.objects.count()
        
        # Obtenemos consolidados "Total" (criterio=None) del semestre activo una sola vez
        consolidados_totales = EvaluacionConsolidada.objects.filter(
            semestre=semestre_activo,
            criterio__isnull=True
        ).select_related('docente')

        # KPI: Promedio General
        res_avg = consolidados_totales.aggregate(avg=Avg('puntaje_final'))
        promedio_general = res_avg['avg']

        # Si no hay consolidados, calculamos desde EvaluacionCurso
        if promedio_general is None:
            promedio_general = EvaluacionCurso.objects.filter(
                curso_dado__semestre=semestre_activo
            ).aggregate(avg=Avg('puntaje_curso'))['avg'] or 0

        if promedio_general > 10.1: promedio_general /= 10

        # KPI: Riesgo y Distribución (Reutilizando consolidados si existen)
        if consolidados_totales.exists():
            # Filtramos en memoria o con sub-consultas rápidas
            docentes_con_nota = consolidados_totales.count()
            docentes_riesgo = consolidados_totales.filter(puntaje_final__lt=6).count()
            
            excelente = consolidados_totales.filter(puntaje_final__gte=8).count()
            buena = consolidados_totales.filter(puntaje_final__gte=6, puntaje_final__lt=8).count()
            deficiente = docentes_riesgo
        else:
            # Fallback a anotaciones por docente (Consulta más pesada, pero necesaria si no hay consolidación)
            docentes_stats = Docente.objects.annotate(
                avg_punteo=Avg('asignaciones__evaluacioncurso__puntaje_curso', filter=Q(asignaciones__semestre=semestre_activo))
            ).filter(avg_punteo__isnull=False)
            
            docentes_con_nota = docentes_stats.count()
            docentes_riesgo = docentes_stats.filter(Q(avg_punteo__lt=6) | Q(avg_punteo__lt=60, avg_punteo__gt=10)).count()
            
            excelente = docentes_stats.filter(Q(avg_punteo__gte=80) | Q(avg_punteo__gte=8, avg_punteo__lte=10)).count()
            buena = docentes_stats.filter(
                (Q(avg_punteo__gte=60) & Q(avg_punteo__lt=80)) | (Q(avg_punteo__gte=6) & Q(avg_punteo__lt=8))
            ).count()
            deficiente = docentes_riesgo

        progreso = f"{(docentes_con_nota / total_docentes * 100):.0f}%" if total_docentes > 0 else "0%"

        # --- 2. PROMEDIOS POR CATEGORÍA ---
        mapping_nombres = {
            'Evaluaciones Estudiantes': 'Estudiantil',
            'Capacitaciones CEAT':       'CEAT',
            'Autoevaluaciones':          'Autoevaluación',
            'Control Docente':           'Coordinador',
            'Criterios de Coordinador':  'Coordinador',
            'Checklist':                 'Checklists',
            'visitas':                   'Checklists'
        }
        
        # Combinamos promedios de consolidados y de cursos en una sola estructura
        promedios_data = {}
        
        # Agregamos consolidados por criterio
        qs_criterios_cons = EvaluacionConsolidada.objects.filter(
            semestre=semestre_activo, criterio__isnull=False
        ).values('criterio__nombre').annotate(v=Avg('puntaje_final'))
        
        for p in qs_criterios_cons:
            name = mapping_nombres.get(p['criterio__nombre'], p['criterio__nombre'])
            val = p['v'] or 0
            if val > 10.1: val /= 10
            promedios_data[name] = round(val, 1)

        # Agregamos cursos por criterio (si no estaban ya)
        qs_criterios_curs = EvaluacionCurso.objects.filter(
            curso_dado__semestre=semestre_activo
        ).values('criterio__nombre').annotate(v=Avg('puntaje_curso'))
        
        for p in qs_criterios_curs:
            name = mapping_nombres.get(p['criterio__nombre'], p['criterio__nombre'])
            if name not in promedios_data:
                val = p['v'] or 0
                if val > 10.1: val /= 10
                promedios_data[name] = round(val, 1)

        # Checklists (Última observación por curso)
        ultima_obs = ChecklistObservation.objects.filter(
            curso_dado__semestre=semestre_activo
        ).order_by('curso_dado', '-fecha_observacion').distinct('curso_dado')
        
        # Django no permite Avg en distinct querysets directamente de forma fácil, usamos subquery o lista
        avg_ch = ChecklistObservation.objects.filter(
            id__in=Subquery(
                ChecklistObservation.objects.filter(
                    curso_dado__semestre=semestre_activo
                ).order_by('curso_dado', '-fecha_observacion').distinct('curso_dado').values('id')
            )
        ).aggregate(v=Avg('punteo'))['v']
        
        if avg_ch:
            if avg_ch > 10.1: avg_ch /= 10
            promedios_data['Checklists'] = round(float(avg_ch), 1)

        # --- 3. TOP DOCENTES Y PONDERACIONES ---
        top_docentes_qs = Docente.objects.select_related('facultad').annotate(
            promedio=Avg('asignaciones__evaluacioncurso__puntaje_curso', filter=Q(asignaciones__semestre=semestre_activo))
        ).filter(promedio__isnull=False).order_by('-promedio')[:4]

        top_docentes = [{
            "id": d.id, "nombre": d.nombre_completo,
            "iniciales": "".join([n[0] for n in d.nombre_completo.split()[:2]]).upper(),
            "facultad": d.facultad.nombre if d.facultad else "",
            "ponderacion": round(d.promedio, 1),
            "estado": "Excelente" if d.promedio >= 8 else "Buena" if d.promedio >= 6 else "Deficiente"
        } for d in top_docentes_qs]

        ponderaciones = ConfiguracionPonderacion.objects.filter(semestre=semestre_activo).select_related('criterio')
        data_ponderaciones = [{
            "id": p.id, "CriterioNombre": p.criterio.nombre, "porcentaje_asignado": p.porcentaje_asignado
        } for p in ponderaciones]

        return response.Response({
            "stats": {
                "total_docentes": total_docentes,
                "promedio_general": round(promedio_general, 1),
                "docentes_riesgo": docentes_riesgo,
                "progreso_evaluacion": progreso
            },
            "data_promedios": [{"name": k, "valor": v} for k, v in promedios_data.items()],
            "distribution_data": [
                {"name": "Excelente", "value": excelente, "color": "#10B981"},
                {"name": "Buena", "value": buena, "color": "#F59E0B"},
                {"name": "Deficiente", "value": deficiente, "color": "#EF4444"},
            ],
            "top_docentes": top_docentes,
            "data_ponderaciones": data_ponderaciones
        })

    @decorators.action(detail=False, methods=['get'])
    def estadisticas(self, request):
        return response.Response({})

    @decorators.action(detail=False, methods=['get'])
    def promedios_criterios(self, request):
        return response.Response([])

    @decorators.action(detail=False, methods=['get'])
    def distribucion_rendimiento(self, request):
        return response.Response([])

