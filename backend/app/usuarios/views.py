from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend

from .models import Usuario, Docente
from .serializers import UsuarioSerializer, DocenteSerializer


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.select_related('carrera').all().order_by('username')
    serializer_class = UsuarioSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    
    #Opciones de filtrado y de busqueda para los coordinadores
    filterset_fields = ['carrera', 'is_staff', 'is_active', 'facultad']
    search_fields = ['username', 'email', 'first_name', 'last_name']


class DocenteViewSet(viewsets.ModelViewSet):
    queryset = Docente.objects.all().order_by('nombre_completo')
    serializer_class = DocenteSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]

    # Opcines de filrado y busqueda para los docentes 
    filterset_fields = ['tipo_plan']
    search_fields = ['codigo_docente', 'nombre_completo']