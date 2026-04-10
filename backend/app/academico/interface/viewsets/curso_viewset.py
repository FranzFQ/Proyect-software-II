from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from academico.models import Curso
from academico.serializers import CursoSerializer

class CursoViewSet(viewsets.ModelViewSet):
    queryset = Curso.objects.all()
    serializer_class = CursoSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['nombre_curso']