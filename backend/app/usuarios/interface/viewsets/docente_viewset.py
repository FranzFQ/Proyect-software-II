from django.db.models import Avg, Q, Prefetch, Count, Sum, OuterRef, Subquery
from rest_framework import viewsets, filters, pagination
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from usuarios.models import Docente
from usuarios.serializers import DocenteSerializer
from academico.models import Semestre
from evaluaciones.models import (
    CursoDado, EvaluacionConsolidada, EvaluacionCurso, 
    ConfiguracionPonderacion, ChecklistObservation
)
from evaluaciones.serializers import CursoDadoSerializer, EvaluacionConsolidadaSerializer

def calcular_punteo_ponderado(docente, semestre, ponderaciones=None):
    """
    Calcula el puntaje ponderado de un docente para un semestre específico.
    Lógica centralizada para garantizar consistencia entre lista y perfil.
    """
    if not docente or not semestre:
        return 0.0

    # 1. Obtener criterios globales (ej: CEAT)
    evaluaciones_consolidadas = EvaluacionConsolidada.objects.filter(
        docente=docente,
        semestre=semestre
    ).select_related('criterio')

    # Buscar el consolidado total previo si existe (como fallback)
    evaluacion_total_obj = evaluaciones_consolidadas.filter(criterio__isnull=True).first()
    puntaje_base = evaluacion_total_obj.puntaje_final if evaluacion_total_obj else 0.0
    
    # 2. Obtener promedios de evaluaciones por curso para este docente
    promedios_cursos = EvaluacionCurso.objects.filter(
        curso_dado__docente=docente,
        curso_dado__semestre=semestre
    ).values('criterio__nombre').annotate(valor=Avg('puntaje_curso'))

    mapping = {
        'Evaluaciones Estudiantes': 'estudiantil',
        'Capacitaciones CEAT':       'ceat',
        'Autoevaluaciones':          'autoevaluacion',
        'Control Docente':           'coordinador',
        'Criterios de Coordinador':  'coordinador',
        'Checklist':                 'visitas',
        'Apoyo y Colaboración':      'apoyo'
    }

    evaluacion_kpi = {}
    criterios_procesados = set()

    # Agregar consolidados globales
    for ec in evaluaciones_consolidadas.filter(criterio__isnull=False):
        nombre_bd = ec.criterio.nombre
        if nombre_bd in mapping:
            key_kpi = mapping[nombre_bd]
            val = ec.puntaje_final or 0
            if val > 10.1: val = val / 10
            evaluacion_kpi[key_kpi] = val
            criterios_procesados.add(key_kpi)

    # Agregar promedios por curso
    for pc in promedios_cursos:
        nombre_bd = pc['criterio__nombre']
        if nombre_bd in mapping:
            key_kpi = mapping[nombre_bd]
            if key_kpi not in criterios_procesados:
                val = pc['valor'] or 0
                if val > 10.1: val = val / 10
                evaluacion_kpi[key_kpi] = val
                criterios_procesados.add(key_kpi)

    # 3. Obtener promedios de Checklists manuales
    ultima_obs_ids = ChecklistObservation.objects.filter(
        curso_dado=OuterRef('curso_dado')
    ).order_by('-fecha_observacion').values('id')[:1]

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
    if promedio_ch is not None and 'visitas' not in criterios_procesados:
        val = float(promedio_ch)
        if val > 10.1: val = val / 10
        evaluacion_kpi['visitas'] = val

    # 4. Cálculo Ponderado
    if ponderaciones is None:
        ponderaciones = ConfiguracionPonderacion.objects.filter(semestre=semestre).select_related('criterio')
    
    weighted_score = 0
    total_weight_found = 0
    
    pond_map_inv = {
        'Evaluaciones Estudiantes': 'estudiantil',
        'Capacitaciones CEAT':       'ceat',
        'Autoevaluaciones':          'autoevaluacion',
        'Control Docente':           'coordinador',
        'Criterios de Coordinador':  'coordinador',
        'Checklist':                 'visitas',
        'Apoyo y Colaboración':      'apoyo'
    }

    for p in ponderaciones:
        key = pond_map_inv.get(p.criterio.nombre)
        if key and key in evaluacion_kpi:
            score = evaluacion_kpi[key]
            weight = p.porcentaje_asignado / 100
            weighted_score += (score * weight)
            total_weight_found += p.porcentaje_asignado

    if total_weight_found > 0:
        return round(weighted_score, 1)
    
    # Fallback al puntaje base normalizado si no hay ponderaciones
    return round(puntaje_base if puntaje_base <= 10.1 else puntaje_base / 10, 1)

def calcular_punteo_ponderado_bulk(docentes, semestre, ponderaciones=None):
    """
    Optimización para calcular punteos de múltiples docentes en pocas consultas.
    Evita el problema N+1 en la lista de docentes.
    """
    if not docentes or not semestre:
        return {d.id: 0.0 for d in docentes}

    docente_ids = [d.id for d in docentes]
    
    # 1. Obtener criterios globales para todos
    consolidados_qs = EvaluacionConsolidada.objects.filter(
        docente_id__in=docente_ids,
        semestre=semestre
    ).select_related('criterio')
    
    consolidados_data = {}
    for c in consolidados_qs:
        d_id = c.docente_id
        if d_id not in consolidados_data:
            consolidados_data[d_id] = {'criterios': {}, 'base': 0.0}
        
        if c.criterio is None:
            consolidados_data[d_id]['base'] = c.puntaje_final
        else:
            consolidados_data[d_id]['criterios'][c.criterio.nombre] = c.puntaje_final

    # 2. Promedios por curso para todos
    promedios_cursos_qs = EvaluacionCurso.objects.filter(
        curso_dado__docente_id__in=docente_ids,
        curso_dado__semestre=semestre
    ).values('curso_dado__docente_id', 'criterio__nombre').annotate(valor=Avg('puntaje_curso'))
    
    promedios_cursos_data = {}
    for p in promedios_cursos_qs:
        d_id = p['curso_dado__docente_id']
        if d_id not in promedios_cursos_data:
            promedios_cursos_data[d_id] = {}
        promedios_cursos_data[d_id][p['criterio__nombre']] = p['valor']

    # 3. Checklists manuales (Última obs por curso)
    ultima_obs_ids = ChecklistObservation.objects.filter(
        curso_dado=OuterRef('curso_dado')
    ).order_by('-fecha_observacion').values('id')[:1]

    ultimas_obs_qs = ChecklistObservation.objects.filter(
        id__in=Subquery(
            ChecklistObservation.objects.filter(
                curso_dado__docente_id__in=docente_ids,
                curso_dado__semestre=semestre
            ).values('curso_dado').distinct().annotate(
                last_id=Subquery(ultima_obs_ids)
            ).values('last_id')
        )
    ).values('curso_dado__docente_id').annotate(valor=Avg('punteo'))
    
    checklists_data = {item['curso_dado__docente_id']: item['valor'] for item in ultimas_obs_qs}

    # 4. Cálculo final
    if ponderaciones is None:
        ponderaciones = list(ConfiguracionPonderacion.objects.filter(semestre=semestre).select_related('criterio'))
    
    mapping = {
        'Evaluaciones Estudiantes': 'estudiantil',
        'Capacitaciones CEAT':       'ceat',
        'Autoevaluaciones':          'autoevaluacion',
        'Control Docente':           'coordinador',
        'Criterios de Coordinador':  'coordinador',
        'Checklist':                 'visitas',
        'Apoyo y Colaboración':      'apoyo'
    }

    pond_map_inv = {
        'Evaluaciones Estudiantes': 'estudiantil',
        'Capacitaciones CEAT':       'ceat',
        'Autoevaluaciones':          'autoevaluacion',
        'Control Docente':           'coordinador',
        'Criterios de Coordinador':  'coordinador',
        'Checklist':                 'visitas',
        'Apoyo y Colaboración':      'apoyo'
    }

    results = {}
    for docente in docentes:
        d_id = docente.id
        evaluacion_kpi = {}
        criterios_procesados = set()
        
        d_cons = consolidados_data.get(d_id, {'criterios': {}, 'base': 0.0})
        for nombre_bd, val in d_cons['criterios'].items():
            if nombre_bd in mapping:
                key_kpi = mapping[nombre_bd]
                evaluacion_kpi[key_kpi] = val if val <= 10.1 else val / 10
                criterios_procesados.add(key_kpi)
        
        d_curs = promedios_cursos_data.get(d_id, {})
        for nombre_bd, val in d_curs.items():
            if nombre_bd in mapping:
                key_kpi = mapping[nombre_bd]
                if key_kpi not in criterios_procesados:
                    evaluacion_kpi[key_kpi] = val if val <= 10.1 else val / 10
                    criterios_procesados.add(key_kpi)
        
        p_ch = checklists_data.get(d_id)
        if p_ch is not None and 'visitas' not in criterios_procesados:
            evaluacion_kpi['visitas'] = float(p_ch) if float(p_ch) <= 10.1 else float(p_ch) / 10
            
        weighted_score = 0
        total_weight_found = 0
        for p in ponderaciones:
            key = pond_map_inv.get(p.criterio.nombre)
            if key and key in evaluacion_kpi:
                weighted_score += (evaluacion_kpi[key] * (p.porcentaje_asignado / 100))
                total_weight_found += p.porcentaje_asignado
        
        if total_weight_found > 0:
            results[d_id] = round(weighted_score, 1)
        else:
            puntaje_base = d_cons['base']
            results[d_id] = round(puntaje_base if puntaje_base <= 10.1 else puntaje_base / 10, 1)
            
    return results

class StandardResultsSetPagination(pagination.LimitOffsetPagination):
    default_limit = 20
    max_limit = 100

class DocenteViewSet(viewsets.ModelViewSet):
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        # 1. Buscamos el semestre activo primero
        if not hasattr(self, '_semestre_activo'):
            self._semestre_activo = Semestre.objects.filter(activo_para_carga=True).first()
        
        semestre = self._semestre_activo
        
        # 2. Queryset base con relaciones necesarias
        queryset = Docente.objects.select_related('facultad')
        
        # 3. Solo contamos si hay un semestre activo (el promedio se calcula en list())
        if semestre:
            queryset = queryset.annotate(
                conteo_cursos=Count(
                    'asignaciones',
                    filter=Q(asignaciones__semestre=semestre),
                    distinct=True
                )
            )
        
        return queryset.order_by('nombre_completo')

    serializer_class = DocenteSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['tipo_plan']
    search_fields = ['codigo_docente', 'nombre_completo']

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            semestre = getattr(self, '_semestre_activo', Semestre.objects.filter(activo_para_carga=True).first())
            ponderaciones = list(ConfiguracionPonderacion.objects.filter(semestre=semestre).select_related('criterio')) if semestre else []
            
            punteos_dict = calcular_punteo_ponderado_bulk(page, semestre, ponderaciones)
            
            serializer = self.get_serializer(page, many=True)
            data = serializer.data
            
            for i, doc_data in enumerate(data):
                doc_id = page[i].id
                doc_data['promedio_punteo'] = punteos_dict.get(doc_id, 0.0)
                
            return self.get_paginated_response(data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


    @action(detail=False, methods=['get'])
    def top_docentes(self, request):
        semestre_activo = Semestre.objects.filter(activo_para_carga=True).first()
        if not semestre_activo:
            return Response([])

        # Usar la lógica de cálculo ponderado para el top (limitado a los que tienen evaluaciones)
        ponderaciones = list(ConfiguracionPonderacion.objects.filter(semestre=semestre_activo).select_related('criterio'))
        
        # Obtenemos docentes con actividad en el semestre
        docentes = Docente.objects.filter(
            asignaciones__semestre=semestre_activo
        ).distinct().select_related('facultad')

        docentes_con_punteo = []
        for d in docentes:
            p = calcular_punteo_ponderado(d, semestre_activo, ponderaciones)
            if p > 0:
                docentes_con_punteo.append({
                    "id": d.id,
                    "nombre": d.nombre_completo,
                    "iniciales": "".join([n[0] for n in d.nombre_completo.split()[:2]]).upper(),
                    "facultad": d.facultad.nombre if d.facultad else "",
                    "ponderacion": p,
                    "estado": "Excelente" if p >= 8 else "Buena" if p >= 6 else "Deficiente"
                })

        # Ordenar por punteo y tomar top 4
        docentes_con_punteo.sort(key=lambda x: x['ponderacion'], reverse=True)
        return Response(docentes_con_punteo[:4])

    @action(detail=True, methods=['get'], url_path='historial')
    def historial(self, request, pk=None):
        docente = self.get_object()
        
        # 1. Obtener todos los semestres donde el docente tiene actividad
        semestres_ids = CursoDado.objects.filter(docente=docente).values_list('semestre_id', flat=True).distinct()
        semestres = Semestre.objects.filter(id__in=semestres_ids).order_by('-anio', '-ciclo')

        history_data = []

        for sem in semestres:
            punteo = calcular_punteo_ponderado(docente, sem)

            history_data.append({
                "id": f"{docente.id}-{sem.id}",
                "semestre_id": sem.id,
                "SemestreStr": f"{sem.anio} - Ciclo {sem.ciclo}",
                "puntaje_final": punteo,
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
            sem = Semestre.objects.filter(pk=sem_id).first()
            if not sem: return None

            # Obtener promedios por curso
            pc = EvaluacionCurso.objects.filter(
                curso_dado__docente=docente, curso_dado__semestre=sem
            ).values('criterio__nombre').annotate(v=Avg('puntaje_curso'))
            
            # Obtener consolidados globales
            ec = EvaluacionConsolidada.objects.filter(
                docente=docente, semestre=sem, criterio__isnull=False
            ).values('criterio__nombre').annotate(v=Avg('puntaje_final'))

            # Obtener créditos totales del semestre
            creditos_totales = CursoDado.objects.filter(
                docente=docente, semestre=sem
            ).aggregate(total=Sum('curso__creditos'))['total'] or 0

            # Obtener promedios de Checklists manuales
            ultima_obs_ids = ChecklistObservation.objects.filter(
                curso_dado=OuterRef('curso_dado')
            ).order_by('-fecha_observacion').values('id')[:1]

            ultimas_observaciones = ChecklistObservation.objects.filter(
                id__in=Subquery(
                    ChecklistObservation.objects.filter(
                        curso_dado__docente=docente,
                        curso_dado__semestre=sem
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

            # Usar la nueva función compartida para el puntaje final
            res['puntaje_final'] = calcular_punteo_ponderado(docente, sem)
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

        # 1. Obtener criterios globales y KPIs básicos
        evaluaciones_consolidadas = EvaluacionConsolidada.objects.filter(
            docente=docente,
            semestre=semestre
        ).select_related('criterio')

        # 2. Obtener promedios de evaluaciones por curso
        promedios_cursos = EvaluacionCurso.objects.filter(
            curso_dado__docente=docente,
            curso_dado__semestre=semestre
        ).values('criterio__nombre').annotate(valor=Avg('puntaje_curso'))

        mapping = {
            'Evaluaciones Estudiantes': 'estudiantil',
            'Capacitaciones CEAT':       'ceat',
            'Autoevaluaciones':          'autoevaluacion',
            'Control Docente':           'coordinador',
            'Criterios de Coordinador':  'coordinador',
            'Checklist':                 'visitas',
            'Apoyo y Colaboración':      'apoyo'
        }

        evaluacion_kpi = {
            "puntaje_final": calcular_punteo_ponderado(docente, semestre)
        }

        desglose_final = []
        criterios_procesados = set()

        # Agregar consolidados globales
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

        # Agregar promedios por curso
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

        # 3. Checklists manuales para el desglose
        ultima_obs_ids = ChecklistObservation.objects.filter(
            curso_dado=OuterRef('curso_dado')
        ).order_by('-fecha_observacion').values('id')[:1]

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
        if promedio_ch is not None and 'visitas' not in criterios_procesados:
            val = float(promedio_ch)
            if val > 10.1: val = val / 10
            evaluacion_kpi['visitas'] = round(val, 1)
            desglose_final.append({
                "CriterioNombre": "Visitas",
                "puntaje_final": round(val, 1)
            })
        
        cursos_data = []
        puntajes_map = {}
        for c in cursos:
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

        return Response({
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
        })