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
        # o si se pide ver todo (all=true), no filtramos por fecha.
        if self.action == 'list' and not show_all:
            # En el resto del sistema, solo mostrar si ya llegó la fecha
            queryset = queryset.filter(fecha__lte=ahora)
            
        return queryset

    @action(detail=True, methods=['get'], url_path='cursos')
    def cursos(self, request, pk=None):
        semestre = self.get_object()
        cursos = semestre.cursos.all()
        serializer = CursoSerializer(cursos, many=True)
        return Response(serializer.data)