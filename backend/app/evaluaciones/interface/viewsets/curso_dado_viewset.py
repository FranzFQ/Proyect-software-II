from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from evaluaciones.models import (
    CursoDado,
)
from evaluaciones.serializers import (
    CursoDadoSerializer,
    ChecklistObservationSerializer,
)

class CursoDadoViewSet(viewsets.ModelViewSet):
    queryset = (
        CursoDado.objects
        .select_related('curso', 'docente', 'semestre')
        .all()
        .order_by('semestre', 'curso__nombre_curso')
    )
    serializer_class = CursoDadoSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]

    # Opciones de filtrado y de busqueda para los cursos dados
    filterset_fields = ['docente', 'semestre', 'curso']
    search_fields = ['seccion', 'curso__nombre_curso', 'docente__nombre_completo']

    # Accion adicional para obtener checklists de un curso dado específico
    @action(detail=True, methods=['get'], url_path='checklists')
    def checklists(self, request, pk=None):
        curso_dado = self.get_object()
        checklists = curso_dado.checklists_realizadas.all()
        serializer = ChecklistObservationSerializer(checklists, many=True)
        return Response(serializer.data)