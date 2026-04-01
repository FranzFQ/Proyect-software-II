from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend

from usuarios.models import Docente
from usuarios.serializers import DocenteSerializer

class DocenteViewSet(viewsets.ModelViewSet):
    queryset = Docente.objects.all().order_by('nombre_completo')
    serializer_class = DocenteSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]

    # Opcines de filrado y busqueda para los docentes 
    filterset_fields = ['tipo_plan']
    search_fields = ['codigo_docente', 'nombre_completo']