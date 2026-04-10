from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend

from evaluaciones.models import (
    CriterioEvaluacion,
)
from evaluaciones.serializers import (
    CriterioEvaluacionSerializer,
)

class CriterioEvaluacionViewSet(viewsets.ModelViewSet):
    queryset = CriterioEvaluacion.objects.all().order_by('nombre')
    serializer_class = CriterioEvaluacionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]

    # Opciones de filtrado y de busqueda para los criterios de evaluacion
    filterset_fields = ['alcance']
    search_fields = ['nombre']