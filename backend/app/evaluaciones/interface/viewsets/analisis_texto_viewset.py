from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend

from evaluaciones.models import AnalisisTexto
from evaluaciones.serializers import AnalisisTextoSerializer

class AnalisisTextoViewSet(viewsets.ModelViewSet):
    queryset = (
        AnalisisTexto.objects
        .select_related('curso_dado__curso', 'tipo')
        .all()
    )
    serializer_class = AnalisisTextoSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['curso_dado', 'tipo']
