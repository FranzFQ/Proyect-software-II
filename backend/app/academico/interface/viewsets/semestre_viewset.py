from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from academico.models import Semestre
from academico.serializers import SemestreSerializer, CursoSerializer

class SemestreViewSet(viewsets.ModelViewSet):
    queryset = Semestre.objects.all()
    serializer_class = SemestreSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['anio', 'ciclo', 'activo_para_carga', 'visible', 'fecha', 'finalizado']

    @action(detail=True, methods=['get'], url_path='cursos')
    def cursos(self, request, pk=None):
        semestre = self.get_object()
        cursos = semestre.cursos.all()
        serializer = CursoSerializer(cursos, many=True)
        return Response(serializer.data)