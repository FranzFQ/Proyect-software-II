from rest_framework import viewsets, response, decorators
from django.db.models import Avg, Count, Q, OuterRef, Subquery
from academico.models import Semestre
from usuarios.models import Docente
from usuarios.interface.viewsets.docente_viewset import calcular_punteo_ponderado
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
        docentes_con_actividad = Docente.objects.filter(
            asignaciones__semestre=semestre_activo
        ).distinct()
        
        docentes_con_nota = 0
        suma_punteos = 0
        excelente = 0
        buena = 0
        deficiente = 0
        
        ponderaciones = list(ConfiguracionPonderacion.objects.filter(semestre=semestre_activo).select_related('criterio'))
        
        docentes_con_punteo_list = []

        for d in docentes_con_actividad:
            p = calcular_punteo_ponderado(d, semestre_activo, ponderaciones)
            if p > 0:
                docentes_con_nota += 1
                suma_punteos += p
                
                if p >= 8: excelente += 1
                elif p >= 6: buena += 1
                else: deficiente += 1
                
                docentes_con_punteo_list.append({
                    "id": d.id,
                    "nombre": d.nombre_completo,
                    "iniciales": "".join([n[0] for n in d.nombre_completo.split()[:2]]).upper(),
                    "facultad": d.facultad.nombre if d.facultad else "",
                    "ponderacion": p,
                    "estado": "Excelente" if p >= 8 else "Buena" if p >= 6 else "Deficiente"
                })

        promedio_general = (suma_punteos / docentes_con_nota) if docentes_con_nota > 0 else 0
        docentes_riesgo = deficiente
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

        # Agregamos cursos por criterio
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
        docentes_con_punteo_list.sort(key=lambda x: x['ponderacion'], reverse=True)
        top_docentes = docentes_con_punteo_list[:4]

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

