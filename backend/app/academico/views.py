from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
 
from .models import Carrera, Pensum, Semestre, Curso
from .serializers import (
    CarreraSerializer,
    PensumSerializer,
    SemestreSerializer,
    CursoSerializer,
)

class CarreraViewSet(viewsets.ModelViewSet):
    queryset = Carrera.objects.all()
    serializer_class = CarreraSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre']

    @action(detail=True, methods=['get'], url_path='pensum')
    def pensum(self, request, pk=None):
        carrera = self.get_object()
        pensums = carrera.pensums.all()
        serializer = PensumSerializer(pensums, many=True)
        return Response(serializer.data)
 
class PensumViewSet(viewsets.ModelViewSet):
    queryset = Pensum.objects.all()
    serializer_class = PensumSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['carrera']

    @action(detail=True, methods=['get'], url_path='semestres')
    def semestres(self, request, pk=None):
        pensum = self.get_object()
        semestres = pensum.semestres.all()
        serializer = SemestreSerializer(semestres, many=True)
        return Response(serializer.data)
    
class SemestreViewSet(viewsets.ModelViewSet):
    queryset = Semestre.objects.all()
    serializer_class = SemestreSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['anio', 'ciclo', 'activo_para_carga', 'visible']

    @action(detail=True, methods=['get'], url_path='cursos')
    def cursos(self, request, pk=None):
        semestre = self.get_object()
        cursos = semestre.cursos.all()
        serializer = CursoSerializer(cursos, many=True)
        return Response(serializer.data)
    
class CursoViewSet(viewsets.ModelViewSet):
    queryset = Curso.objects.all()
    serializer_class = CursoSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['nombre_curso']