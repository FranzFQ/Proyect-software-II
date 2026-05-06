from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from django.utils import timezone
from academico.models import Semestre
from academico.serializers import SemestreSerializer, CursoSerializer

class SemestreViewSet(viewsets.ModelViewSet):
    serializer_class = SemestreSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['anio', 'ciclo', 'activo_para_carga', 'visible', 'fecha', 'finalizado']

    def get_queryset(self):
        ahora = timezone.now()
        
        # Sincronización automática: Si ya pasó la fecha, marcar como visible en la DB
        Semestre.objects.filter(
            fecha__lte=ahora, 
            visible=False
        ).update(visible=True)
        
        show_all = self.request.query_params.get('all', 'false').lower() == 'true'
        
        queryset = Semestre.objects.all().order_by('-anio', '-ciclo')
        
        # Si es una acción de detalle (retrieve, update, partial_update, destroy)
        # o si se pide ver todo (all=true), no filtramos por visibilidad.
        if self.action == 'list' and not show_all:
            # MOSTRAR SOLO SI: Está marcado como visible
            # Esto permite que el Admin controle qué semestres históricos se ven.
            queryset = queryset.filter(visible=True)
            
        return queryset

    @action(detail=False, methods=['get'], url_path='activo')
    def get_activo(self, request):
        semestre = Semestre.objects.filter(activo_para_carga=True).first()
        if not semestre:
            return Response({"error": "No hay semestre activo"}, status=404)
        serializer = SemestreSerializer(semestre)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='cursos')
    def cursos(self, request, pk=None):
        semestre = self.get_object()
        cursos = semestre.cursos.all()
        serializer = CursoSerializer(cursos, many=True)
        return Response(serializer.data)