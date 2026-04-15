from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend

from evaluaciones.models import Tipo
from evaluaciones.serializers import TipoSerializer

class TipoViewSet(viewsets.ModelViewSet):
    queryset = Tipo.objects.all().order_by('nombre')
    serializer_class = TipoSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre']
