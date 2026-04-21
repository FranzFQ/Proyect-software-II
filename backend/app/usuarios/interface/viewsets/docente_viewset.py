from django.db.models import Avg, Q
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend

from usuarios.models import Docente
from usuarios.serializers import DocenteSerializer
from academico.models import Semestre

class DocenteViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        # 1. Queryset base con JOIN a facultad
        queryset = Docente.objects.select_related('facultad').all()
        
        # 2. Buscamos el semestre activo
        semestre_activo = Semestre.objects.filter(activo_para_carga=True).first()
        
        # 3. SQL Aggregation: Usamos 'asignaciones' (related_name en CursoDado)
        # y 'evaluacioncurso' (nombre por defecto para EvaluacionCurso)
        if semestre_activo:
            queryset = queryset.annotate(
                promedio_punteo=Avg(
                    'asignaciones__evaluacioncurso__puntaje_curso',
                    filter=Q(asignaciones__semestre=semestre_activo)
                )
            )
        
        return queryset.order_by('nombre_completo')

    serializer_class = DocenteSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['tipo_plan']
    search_fields = ['codigo_docente', 'nombre_completo']