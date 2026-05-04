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

        evaluaciones_consolidadas = EvaluacionConsolidada.objects.filter(
            docente=docente,
            semestre=semestre
        ).select_related('criterio')

        # Buscar el consolidado total (donde criterio es None) para los KPI rápidos
        evaluacion_total = evaluaciones_consolidadas.filter(criterio__isnull=True).first()

        cursos_data = []
        puntajes_map = {}
        for c in cursos:
            punteo = None
            if hasattr(c, 'evaluaciones') and c.evaluaciones:
                punteo = c.evaluaciones[0].puntaje_curso
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
            "evaluaciones_desglose": EvaluacionConsolidadaSerializer(evaluaciones_consolidadas.filter(criterio__isnull=False), many=True).data,
            "puntajes_map": puntajes_map
        }

        return Response(data)