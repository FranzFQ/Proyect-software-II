from rest_framework import viewsets, filters
from academico.models import Facultad
from academico.serializers import FacultadSerializer

class FacultadViewSet(viewsets.ModelViewSet):
    queryset = Facultad.objects.all()
    serializer_class = FacultadSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre']
