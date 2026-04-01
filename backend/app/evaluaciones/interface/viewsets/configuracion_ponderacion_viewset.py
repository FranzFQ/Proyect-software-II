from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend

from evaluaciones.models import (
    ConfiguracionPonderacion,
)
from evaluaciones.serializers import (
    ConfiguracionPonderacionSerializer,
)

class ConfiguracionPonderacionViewSet(viewsets.ModelViewSet):
    queryset = (
        ConfiguracionPonderacion.objects
        .select_related('semestre', 'criterio')
        .all()
        .order_by('semestre', 'criterio__nombre')
    )
    serializer_class = ConfiguracionPonderacionSerializer
    filter_backends = [DjangoFilterBackend]

    # Opcion de filtrado para la conficuracion de pondaraciones
    filterset_fields = ['semestre', 'criterio',]