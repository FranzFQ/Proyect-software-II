from django.db.models import Avg, Q, Prefetch
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from usuarios.models import Docente
from usuarios.serializers import DocenteSerializer
from academico.models import Semestre
from evaluaciones.models import CursoDado, EvaluacionConsolidada, EvaluacionCurso
from evaluaciones.serializers import CursoDadoSerializer, EvaluacionConsolidadaSerializer

class DocenteViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        # 1. Queryset base con JOIN a facultad
        queryset = Docente.objects.select_related('facultad').all()
        
        # 2. Buscamos el semestre activo (usando el nombre original)
        semestre_activo = Semestre.objects.filter(activo_para_carga=True).first()
        
        # 3. SQL Aggregation: Usamos 'asignaciones' (related_name en CursoDado)
        # y 'evaluacioncurso' (nombre por defecto para EvaluacionCurso)
        if semestre_activo:
            queryset = queryset.annotate(
                promedio_punteo=Avg(
                    'asignaciones__evaluacioncurso__puntaje_curso',
                    filter=Q(asignaciones__semestre=semestre_activo)
                )
            )
        
        return queryset.order_by('nombre_completo')

    serializer_class = DocenteSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['tipo_plan']
    search_fields = ['codigo_docente', 'nombre_completo']

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

        # Cursos del docente en ese semestre con sus puntajes
        cursos = CursoDado.objects.filter(
            docente=docente, 
            semestre=semestre
        ).select_related('curso').prefetch_related(
            Prefetch(
                'evaluacioncurso_set', # Nombre por defecto de la relación inversa
                queryset=EvaluacionCurso.objects.all(),
                to_attr='evaluaciones'
            )
        )

        # Evaluación consolidada
        evaluacion_consolidada = EvaluacionConsolidada.objects.filter(
            docente=docente,
            semestre=semestre
        ).first()

        # Serialización manual de la data combinada para máxima eficiencia
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
            "evaluacion": EvaluacionConsolidadaSerializer(evaluacion_consolidada).data if evaluacion_consolidada else None,
            "puntajes_map": puntajes_map
        }

        return Response(data)