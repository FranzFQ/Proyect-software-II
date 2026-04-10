from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend

from evaluaciones.models import (
    ChecklistObservation,
)
from evaluaciones.serializers import (
    ChecklistObservationSerializer,
)

class ChecklistObservationViewSet(viewsets.ModelViewSet):
    queryset = (
        ChecklistObservation.objects
        .select_related('curso_dado__curso', 'usuario')
        .all()
        .order_by('-fecha_observacion')
    )
    serializer_class = ChecklistObservationSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]

    # Busqueda y filatrado para los checklists de observaciones
    filterset_fields = ['curso_dado', 'usuario']
    search_fields = ['titulo']