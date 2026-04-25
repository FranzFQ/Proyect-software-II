from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from evaluaciones.models import Checklist
from evaluaciones.serializers import ChecklistSerializer

class ChecklistViewSet(viewsets.ModelViewSet):
    queryset = Checklist.objects.all().order_by('titulo')
    serializer_class = ChecklistSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['activo']
    search_fields = ['titulo']
