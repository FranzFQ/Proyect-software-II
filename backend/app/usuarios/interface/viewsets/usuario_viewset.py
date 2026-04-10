from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend

from usuarios.models import Usuario
from usuarios.serializers import UsuarioSerializer

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.select_related('carrera').all().order_by('username')
    serializer_class = UsuarioSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    
    #Opciones de filtrado y de busqueda para los coordinadores
    filterset_fields = ['carrera', 'is_staff', 'is_active', 'facultad']
    search_fields = ['username', 'email', 'first_name', 'last_name']