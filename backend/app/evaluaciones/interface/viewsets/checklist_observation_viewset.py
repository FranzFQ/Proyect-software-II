from rest_framework import viewsets, filters, pagination
from django_filters.rest_framework import DjangoFilterBackend

from evaluaciones.models import ChecklistObservation
from evaluaciones.serializers import (
    ChecklistObservationSerializer,
    ChecklistObservationListSerializer
)

class ChecklistPagination(pagination.LimitOffsetPagination):
    default_limit = 12
    max_limit = 50

class ChecklistObservationViewSet(viewsets.ModelViewSet):
    pagination_class = ChecklistPagination
    
    def get_queryset(self):
        return (
            ChecklistObservation.objects
            .select_related('curso_dado__curso', 'usuario', 'curso_dado__docente')
            .all()
            .order_by('-fecha_observacion')
        )

    def get_serializer_class(self):
        # Para la lista usamos el serializador ligero (sin el JSON pesado)
        if self.action == 'list':
            return ChecklistObservationListSerializer
        # Para crear, editar o ver detalle usamos el completo
        return ChecklistObservationSerializer

    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['curso_dado', 'usuario']
    search_fields = ['titulo']
