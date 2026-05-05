from django.db.models import Avg, Q, Prefetch, Count
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
        # 1. Buscamos el semestre activo primero
        semestre_activo = Semestre.objects.filter(activo_para_carga=True).first()
        
        # 2. Queryset base
        queryset = Docente.objects.select_related('facultad')
        
        # 3. Solo promediamos y contamos si hay un semestre activo
        if semestre_activo:
            queryset = queryset.annotate(
                promedio_punteo=Avg(
                    'asignaciones__evaluacioncurso__puntaje_curso',
                    filter=Q(asignaciones__semestre=semestre_activo)
                ),
                conteo_cursos=Count(
                    'asignaciones',
                    filter=Q(asignaciones__semestre=semestre_activo),
                    distinct=True
                )
            )
        
        # 4. Retornamos ordenado y con campos limitados
        return queryset.order_by('nombre_completo').only(
            'id', 'codigo_docente', 'nombre_completo', 'facultad__nombre', 'tipo_plan'
        )

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

        # 1. Obtener criterios globales ya consolidados (ej: CEAT)
        evaluaciones_consolidadas = EvaluacionConsolidada.objects.filter(
            docente=docente,
            semestre=semestre
        ).select_related('criterio')

        # Buscar el consolidado total (donde criterio es None) para los KPI rápidos
        evaluacion_total = evaluaciones_consolidadas.filter(criterio__isnull=True).first()

        # 2. Obtener promedios de evaluaciones por curso para este docente
        # (ej: Estudiantil, Coordinador)
        promedios_cursos = EvaluacionCurso.objects.filter(
            curso_dado__docente=docente,
            curso_dado__semestre=semestre
        ).values('criterio__nombre').annotate(valor=Avg('puntaje_curso'))

        # Mapeo para normalizar nombres
        mapping = {
            'Evaluaciones Estudiantes': 'Estudiantil',
            'Capacitaciones CEAT':       'CEAT',
            'Autoevaluaciones':          'Autoevaluación',
            'Control Docente':           'Coordinador',
            'Criterios de Coordinador':  'Coordinador',
            'Checklist':                 'visitas',
            'Apoyo y Colaboración':      'Apoyo'
        }

        # Construir desglose combinado
        desglose_final = []
        criterios_procesados = set()

        # Agregar consolidados globales
        for ec in evaluaciones_consolidadas.filter(criterio__isnull=False):
            nombre_bd = ec.criterio.nombre
            if nombre_bd in mapping:
                nombre_corto = mapping[nombre_bd]
                val = ec.puntaje_final or 0
                if val > 10.1: val = val / 10
                desglose_final.append({
                    "CriterioNombre": nombre_corto,
                    "puntaje_final": round(val, 1)
                })
                criterios_procesados.add(nombre_corto)

        # Agregar promedios por curso (solo si no están ya en el desglose)
        for pc in promedios_cursos:
            nombre_bd = pc['criterio__nombre']
            if nombre_bd in mapping:
                nombre_corto = mapping[nombre_bd]
                if nombre_corto not in criterios_procesados:
                    val = pc['valor'] or 0
                    if val > 10.1: val = val / 10
                    desglose_final.append({
                        "CriterioNombre": nombre_corto,
                        "puntaje_final": round(val, 1)
                    })
                    criterios_procesados.add(nombre_corto)

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
            "evaluacion": EvaluacionConsolidadaSerializer(evaluacion_total).data if evaluacion_total else None,
            "evaluaciones_desglose": desglose_final,
            "puntajes_map": puntajes_map
        }

        return Response(data)