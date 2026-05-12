from django.db.models import Avg, Q, Prefetch, Count, Sum
from rest_framework import viewsets, filters, pagination
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from usuarios.models import Docente
from usuarios.serializers import DocenteSerializer
from academico.models import Semestre
from evaluaciones.models import CursoDado, EvaluacionConsolidada, EvaluacionCurso
from evaluaciones.serializers import CursoDadoSerializer, EvaluacionConsolidadaSerializer

class StandardResultsSetPagination(pagination.LimitOffsetPagination):
    default_limit = 20
    max_limit = 100

class DocenteViewSet(viewsets.ModelViewSet):
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        # 1. Buscamos el semestre activo primero (cacheamos en el objeto para la duración de la petición)
        if not hasattr(self, '_semestre_activo'):
            self._semestre_activo = Semestre.objects.filter(activo_para_carga=True).first()
        
        semestre = self._semestre_activo
        
        # 2. Queryset base con relaciones necesarias
        queryset = Docente.objects.select_related('facultad')
        
        # 3. Solo promediamos y contamos si hay un semestre activo
        # Usamos coalese para evitar nulos y mejorar consistencia
        from django.db.models.functions import Coalesce
        if semestre:
            queryset = queryset.annotate(
                promedio_punteo=Coalesce(Avg(
                    'asignaciones__evaluacioncurso__puntaje_curso',
                    filter=Q(asignaciones__semestre=semestre)
                ), 0.0),
                conteo_cursos=Count(
                    'asignaciones',
                    filter=Q(asignaciones__semestre=semestre),
                    distinct=True
                )
            )
        
        # 4. Retornamos ordenado y con campos limitados para no traer datos de más
        return queryset.order_by('nombre_completo')

    serializer_class = DocenteSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['tipo_plan']
    search_fields = ['codigo_docente', 'nombre_completo']

    @action(detail=False, methods=['get'])
    def top_docentes(self, request):
        semestre_activo = Semestre.objects.filter(activo_para_carga=True).first()
        if not semestre_activo:
            return Response([])

        # Top 4 docentes por promedio de curso
        top = Docente.objects.select_related('facultad').annotate(
            promedio=Avg(
                'asignaciones__evaluacioncurso__puntaje_curso',
                filter=Q(asignaciones__semestre=semestre_activo)
            )
        ).filter(promedio__isnull=False).order_by('-promedio')[:4]

        data = []
        for d in top:
            # Determinamos estado para el badge
            p = d.promedio
            estado = "Excelente" if p >= 8 else "Buena" if p >= 6 else "Deficiente"
            
            data.append({
                "id": d.id,
                "nombre": d.nombre_completo,
                "iniciales": "".join([n[0] for n in d.nombre_completo.split()[:2]]).upper(),
                "facultad": d.facultad.nombre if d.facultad else "",
                "ponderacion": round(p, 1),
                "estado": estado
            })

        return Response(data)

    @action(detail=True, methods=['get'], url_path='historial')
    def historial(self, request, pk=None):
        docente = self.get_object()
        
        # 1. Obtener todos los semestres donde el docente tiene actividad
        semestres_ids = CursoDado.objects.filter(docente=docente).values_list('semestre_id', flat=True).distinct()
        semestres = Semestre.objects.filter(id__in=semestres_ids).order_by('-anio', '-ciclo')

        history_data = []

        for sem in semestres:
            # Prioridad 1: EvaluacionConsolidada Total (criterio=None)
            cons = EvaluacionConsolidada.objects.filter(docente=docente, semestre=sem, criterio__isnull=True).first()
            
            punteo = 0.0
            if cons:
                punteo = cons.puntaje_final
            else:
                # Prioridad 2: Promedio de EvaluacionCurso
                avg_res = EvaluacionCurso.objects.filter(curso_dado__docente=docente, curso_dado__semestre=sem).aggregate(avg=Avg('puntaje_curso'))
                punteo = avg_res['avg'] or 0.0

            # Normalizar escala 100 a 10 si es necesario para consistencia visual
            score_final = punteo
            if score_final > 10.1:
                score_final = score_final / 10

            history_data.append({
                "id": f"{docente.id}-{sem.id}",
                "semestre_id": sem.id,
                "SemestreStr": f"{sem.anio} - Ciclo {sem.ciclo}",
                "puntaje_final": round(score_final, 1),
            })

        return Response(history_data)

    @action(detail=True, methods=['get'], url_path='comparacion')
    def comparacion(self, request, pk=None):
        docente = self.get_object()
        sem_a_id = request.query_params.get('semestre_a')
        sem_b_id = request.query_params.get('semestre_b')

        if not sem_a_id or not sem_b_id:
            return Response({"error": "Parámetros faltantes"}, status=400)

        def get_eval_data(sem_id):
            # Obtener promedios por curso
            pc = EvaluacionCurso.objects.filter(
                curso_dado__docente=docente, curso_dado__semestre_id=sem_id
            ).values('criterio__nombre').annotate(v=Avg('puntaje_curso'))
            
            # Obtener consolidados globales
            ec = EvaluacionConsolidada.objects.filter(
                docente=docente, semestre_id=sem_id, criterio__isnull=False
            ).values('criterio__nombre').annotate(v=Avg('puntaje_final'))

            # Obtener créditos totales del semestre
            creditos_totales = CursoDado.objects.filter(
                docente=docente, semestre_id=sem_id
            ).aggregate(total=Sum('curso__creditos'))['total'] or 0

            # Obtener promedios de Checklists manuales (ChecklistObservation)
            from evaluaciones.models import ChecklistObservation
            from django.db.models import OuterRef, Subquery

            ultima_obs_ids = ChecklistObservation.objects.filter(
                curso_dado=OuterRef('curso_dado')
            ).order_by('-fecha_observacion').values('id')[:1]

            ultimas_observaciones = ChecklistObservation.objects.filter(
                id__in=Subquery(
                    ChecklistObservation.objects.filter(
                        curso_dado__docente=docente,
                        curso_dado__semestre_id=sem_id
                    ).values('curso_dado').distinct().annotate(
                        last_id=Subquery(ultima_obs_ids)
                    ).values('last_id')
                )
            )
            promedio_manual_ch = ultimas_observaciones.aggregate(v=Avg('punteo'))['v']

            mapping = {
                'Evaluaciones Estudiantes': 'puntaje_evaluacion_estudiantes',
                'Control Docente':           'puntaje_coordinador',
                'Criterios de Coordinador':  'puntaje_coordinador',
                'Capacitaciones CEAT':       'ceat',
                'Checklist':                 'puntaje_checklist',
                'visitas':                   'puntaje_checklist'
            }

            res = { k: 0.0 for k in mapping.values() }
            res['total_creditos'] = creditos_totales
            found_any = False

            # Procesar evaluaciones de curso y consolidados
            for item in list(pc) + list(ec):
                key = mapping.get(item['criterio__nombre'])
                if key:
                    val = item['v'] or 0
                    if val > 10.1: val = val / 10
                    res[key] = round(val, 1)
                    found_any = True
            
            # Si hay promedios de checklist manual y no se obtuvo por EvaluacionCurso
            if promedio_manual_ch and res.get('puntaje_checklist', 0) == 0:
                val = float(promedio_manual_ch)
                if val > 10.1: val /= 10
                res['puntaje_checklist'] = round(val, 1)
                found_any = True

            # Solo retornamos None si no hay ni evaluaciones ni créditos
            if not found_any and creditos_totales == 0:
                return None

            # Calcular puntaje_final como promedio de los criterios que no son 0 (Excluyendo total_creditos)
            score_keys = set(mapping.values())
            vals = [res[k] for k in score_keys if res[k] > 0]
            res['puntaje_final'] = round(sum(vals)/len(vals), 1) if vals else 0.0
            return res

        return Response({
            "semestre_a": get_eval_data(sem_a_id),
            "semestre_b": get_eval_data(sem_b_id)
        })

    @action(detail=True, methods=['get'], url_path='perfil')
    def perfil(self, request, pk=None):
        docente = self.get_object()
        semestre_id = request.query_params.get('semestre')
        
        if semestre_id:
            semestre = Semestre.objects.filter(pk=semestre_id).first()
        else:
            semestre = Semestre.objects.filter(activo_para_carga=True).first()

        if not semestre:
            return Response({"error": "Semestre no encontrado"}, status=404)

        cursos = CursoDado.objects.filter(
            docente=docente, 
            semestre=semestre
        ).select_related('curso').prefetch_related(
            Prefetch(
                'evaluacioncurso_set',
                queryset=EvaluacionCurso.objects.all(),
                to_attr='evaluaciones'
            )
        )

        # 1. Obtener criterios globales (ej: CEAT) y el total (criterio=None)
        evaluaciones_consolidadas = EvaluacionConsolidada.objects.filter(
            docente=docente,
            semestre=semestre
        ).select_related('criterio')

        # Buscar el consolidado total para los KPI rápidos (promedio ponderado final)
        evaluacion_total_obj = evaluaciones_consolidadas.filter(criterio__isnull=True).first()
        
        # 2. Obtener promedios de evaluaciones por curso para este docente
        promedios_cursos = EvaluacionCurso.objects.filter(
            curso_dado__docente=docente,
            curso_dado__semestre=semestre
        ).values('criterio__nombre').annotate(valor=Avg('puntaje_curso'))

        # Mapeo para normalizar nombres y enviarlos al MetricBox del frontend
        mapping = {
            'Evaluaciones Estudiantes': 'estudiantil',
            'Capacitaciones CEAT':       'ceat',
            'Autoevaluaciones':          'autoevaluacion',
            'Control Docente':           'coordinador',
            'Criterios de Coordinador':  'coordinador',
            'Checklist':                 'visitas',
            'Apoyo y Colaboración':      'apoyo'
        }

        # Construir objeto de evaluación para los KPIs del frontend
        evaluacion_kpi = {
            "puntaje_final": evaluacion_total_obj.puntaje_final if evaluacion_total_obj else 0.0
        }

        # Construir desglose para la gráfica
        desglose_final = []
        criterios_procesados = set()

        # Agregar consolidados globales (CEAT, etc)
        for ec in evaluaciones_consolidadas.filter(criterio__isnull=False):
            nombre_bd = ec.criterio.nombre
            if nombre_bd in mapping:
                key_kpi = mapping[nombre_bd]
                val = ec.puntaje_final or 0
                if val > 10.1: val = val / 10
                
                evaluacion_kpi[key_kpi] = round(val, 1)
                desglose_final.append({
                    "CriterioNombre": key_kpi.capitalize(),
                    "puntaje_final": round(val, 1)
                })
                criterios_procesados.add(key_kpi)

        # Agregar promedios por curso (Estudiantil, Coordinador, etc)
        for pc in promedios_cursos:
            nombre_bd = pc['criterio__nombre']
            if nombre_bd in mapping:
                key_kpi = mapping[nombre_bd]
                if key_kpi not in criterios_procesados:
                    val = pc['valor'] or 0
                    if val > 10.1: val = val / 10
                    
                    evaluacion_kpi[key_kpi] = round(val, 1)
                    desglose_final.append({
                        "CriterioNombre": key_kpi.capitalize(),
                        "puntaje_final": round(val, 1)
                    })
                    criterios_procesados.add(key_kpi)

        # 3. Obtener promedios de Checklists manuales (ChecklistObservation)
        # Lógica: Tomar solo la ÚLTIMA observación de cada curso del docente y promediarlas
        from evaluaciones.models import ChecklistObservation
        from django.db.models import OuterRef, Subquery

        # Subquery para obtener el ID de la última observación por curso dado
        ultima_obs_ids = ChecklistObservation.objects.filter(
            curso_dado=OuterRef('curso_dado')
        ).order_by('-fecha_observacion').values('id')[:1]

        # Filtrar observaciones del docente que sean las últimas de su respectivo curso_dado
        ultimas_observaciones = ChecklistObservation.objects.filter(
            id__in=Subquery(
                ChecklistObservation.objects.filter(
                    curso_dado__docente=docente,
                    curso_dado__semestre=semestre
                ).values('curso_dado').distinct().annotate(
                    last_id=Subquery(ultima_obs_ids)
                ).values('last_id')
            )
        )

        promedio_ch = ultimas_observaciones.aggregate(valor=Avg('punteo'))['valor']

        if promedio_ch is not None:
            val = float(promedio_ch)
            if val > 10.1: val = val / 10
            
            # Si no se ha procesado ya por EvaluacionConsolidada/Curso
            if 'visitas' not in criterios_procesados:
                evaluacion_kpi['visitas'] = round(val, 1)
                desglose_final.append({
                    "CriterioNombre": "Visitas",
                    "puntaje_final": round(val, 1)
                })
                criterios_procesados.add('visitas')

        cursos_data = []
        puntajes_map = {}
        for c in cursos:
            # Punteo promedio del curso (promediando sus distintos criterios)
            punteo = EvaluacionCurso.objects.filter(curso_dado=c).aggregate(Avg('puntaje_curso'))['puntaje_curso__avg']
            if punteo:
                if punteo > 10.1: punteo = punteo / 10
                punteo = round(punteo, 1)
                puntajes_map[c.id] = punteo

            cursos_data.append({
                "id": c.id,
                "curso": c.curso.id,
                "CursosNombre": c.curso.nombre_curso,
                "seccion": c.seccion,
                "punteo": punteo
            })

        data = {
            "docente": DocenteSerializer(docente).data,
            "semestre": {
                "id": semestre.id,
                "anio": semestre.anio,
                "ciclo": semestre.ciclo,
                "estado": semestre.estado
            },
            "cursos": cursos_data,
            "evaluacion": evaluacion_kpi,
            "evaluaciones_desglose": desglose_final,
            "puntajes_map": puntajes_map
        }

        return Response(data)