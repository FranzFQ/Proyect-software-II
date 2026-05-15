from rest_framework import viewsets, filters, pagination
from django_filters.rest_framework import DjangoFilterBackend
import django_filters

from evaluaciones.models import ChecklistObservation
from evaluaciones.serializers import (
    ChecklistObservationSerializer,
    ChecklistObservationListSerializer
)

class ChecklistPagination(pagination.LimitOffsetPagination):
    default_limit = 12
    max_limit = 100


class ChecklistObservationFilter(django_filters.FilterSet):
    docente = django_filters.NumberFilter(field_name='curso_dado__docente__id')
    semestre = django_filters.NumberFilter(field_name='curso_dado__semestre__id')

    class Meta:
        model = ChecklistObservation
        fields = ['curso_dado', 'usuario', 'docente', 'checklist', 'semestre']


class ChecklistObservationViewSet(viewsets.ModelViewSet):
    pagination_class = ChecklistPagination

    def get_queryset(self):
        return (
            ChecklistObservation.objects
            .select_related(
                'curso_dado__curso',
                'curso_dado__docente',
                'checklist',
                'usuario',
            )
            .all()
            .order_by('-fecha_observacion')
        )

    def get_serializer_class(self):
        if self.action == 'list':
            return ChecklistObservationListSerializer
        return ChecklistObservationSerializer

    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = ChecklistObservationFilter
    search_fields = ['checklist__titulo']