from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend

from evaluaciones.models import (
    EvaluacionConsolidada,
)
from evaluaciones.serializers import (
    EvaluacionConsolidadaSerializer,
)

class EvaluacionConsolidadaViewSet(viewsets.ModelViewSet):
    queryset = (
        EvaluacionConsolidada.objects
        .select_related('docente', 'semestre')
        .prefetch_related('gotas_curso', 'detalles_globales')
        .all()
        .order_by('semestre', 'docente__nombre_completo')
    )
    serializer_class = EvaluacionConsolidadaSerializer
    filter_backends = [DjangoFilterBackend]

    # Opcion de filtrado para los docentes y los semestres
    filterset_fields = ['docente', 'semestre']
