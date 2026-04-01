from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend

from evaluaciones.models import (
    EvaluacionCurso,
)
from evaluaciones.serializers import (
    EvaluacionCursoSerializer,
)

class EvaluacionCursoViewSet(viewsets.ModelViewSet):
    queryset = (
        EvaluacionCurso.objects
        .select_related('evaluacion_consolidada', 'curso_dado__curso')
        .prefetch_related('detalles_curso')
        .all()
    )
    serializer_class = EvaluacionCursoSerializer
    filter_backends = [DjangoFilterBackend]

    # Opcion de filtrado para las evaluaciones cd curso
    filterset_fields = ['evaluacion_consolidada', 'curso_dado']