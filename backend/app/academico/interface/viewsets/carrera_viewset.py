from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from models import Carrera
from serializers import CarreraSerializer, PensumSerializer

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