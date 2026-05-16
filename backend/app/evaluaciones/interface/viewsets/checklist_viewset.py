from rest_framework import viewsets, filters, pagination, decorators, response
from django_filters.rest_framework import DjangoFilterBackend
import django_filters

from evaluaciones.models import Checklist
from evaluaciones.serializers import ChecklistSerializer
from academico.models import Semestre


class ChecklistPagination(pagination.LimitOffsetPagination):
    default_limit = 12
    max_limit = 100


class ChecklistFilter(django_filters.FilterSet):
    semestre = django_filters.NumberFilter(field_name='semestre__id')
    usuario_creador = django_filters.NumberFilter(field_name='usuario_creador__id')

    class Meta:
        model = Checklist
        fields = ['activo', 'semestre', 'usuario_creador']


class ChecklistViewSet(viewsets.ModelViewSet):
    serializer_class = ChecklistSerializer
    pagination_class = ChecklistPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ChecklistFilter
    search_fields = ['titulo']
    ordering_fields = ['titulo', 'id']
    ordering = ['titulo']

    def get_queryset(self):
        user = self.request.user

        semestre_activo = Semestre.objects.filter(activo_para_carga=True).first()

        qs = Checklist.objects.select_related('semestre', 'usuario_creador')

        if user.is_authenticated:
            qs = qs.filter(usuario_creador=user)
        else:
            return qs.none()

        if semestre_activo:
            qs = qs.filter(semestre=semestre_activo)

        return qs

    @decorators.action(detail=False, methods=['get'])
    def count(self, request):
        count = self.get_queryset().count()
        return response.Response({'count': count})

    def perform_create(self, serializer):
        semestre_activo = Semestre.objects.filter(activo_para_carga=True).first()
        serializer.save(
            usuario_creador=self.request.user if self.request.user.is_authenticated else None,
            semestre=semestre_activo,
        )