from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend

from evaluaciones.models import (
    DetalleCriterio,
)
from evaluaciones.serializers import (
    DetalleCriterioSerializer,
)

class DetalleCriterioViewSet(viewsets.ModelViewSet):
    queryset = (
        DetalleCriterio.objects
        .select_related('criterio', 'evaluacion_global', 'evaluacion_curso')
        .all()
    )
    serializer_class = DetalleCriterioSerializer
    filter_backends = [DjangoFilterBackend]

    # Opciones de filtrado para los detalles de criterios
    filterset_fields = ['criterio', 'evaluacion_global', 'evaluacion_curso']