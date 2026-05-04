from rest_framework import viewsets, response, decorators
from django_filters.rest_framework import DjangoFilterBackend
from academico.models import Semestre
from evaluaciones.models import (
    ConfiguracionPonderacion,
    CriterioEvaluacion,
)
from evaluaciones.serializers import (
    ConfiguracionPonderacionSerializer,
)

class ConfiguracionPonderacionViewSet(viewsets.ModelViewSet):
    serializer_class = ConfiguracionPonderacionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['semestre', 'criterio',]

    def get_queryset(self):
        queryset = ConfiguracionPonderacion.objects.select_related('semestre', 'criterio').all()

        # Si no se pasa un semestre por query params, usamos el activo
        semestre_id = self.request.query_params.get('semestre')
        if not semestre_id:
            semestre_activo = Semestre.objects.filter(activo_para_carga=True).first()
            if semestre_activo:
                queryset = queryset.filter(semestre=semestre_activo)

        return queryset.order_by('criterio__nombre')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        # Si no hay ponderaciones para el semestre activo, las inicializamos automáticamente
        semestre_id = request.query_params.get('semestre')
        if not semestre_id:
            semestre_activo = Semestre.objects.filter(activo_para_carga=True).first()
            if semestre_activo and not queryset.exists():
                criterios = CriterioEvaluacion.objects.all()
                for c in criterios:
                    ConfiguracionPonderacion.objects.get_or_create(
                        semestre=semestre_activo,
                        criterio=c,
                        defaults={'porcentaje_asignado': 0}
                    )
                queryset = self.get_queryset() # Recargamos con los nuevos datos

        serializer = self.get_serializer(queryset, many=True)
        return response.Response(serializer.data)