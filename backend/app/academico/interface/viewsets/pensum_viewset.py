from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from models import Pensum
from serializers import PensumSerializer, SemestreSerializer

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