from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from academico.models import Semestre
from evaluaciones.models import (
    EvaluacionConsolidada,
)
from evaluaciones.serializers import (
    EvaluacionConsolidadaSerializer,
)
from evaluaciones.services.ingesta_service import IngestaService

class EvaluacionConsolidadaViewSet(viewsets.ModelViewSet):
    queryset = (
        EvaluacionConsolidada.objects
        .select_related('docente', 'semestre')
        .all()
        .order_by('semestre', 'docente__nombre_completo')
    )
    serializer_class = EvaluacionConsolidadaSerializer
    filter_backends = [DjangoFilterBackend]

    # Opcion de filtrado para los docentes y los semestres
    filterset_fields = ['docente', 'semestre']

    @action(detail=False, methods=['post'], url_path='ingesta')
    def ingesta(self, request):
        archivo = request.FILES.get('archivo')
        origen = request.data.get('origen')
        
        if not archivo or not origen:
            return Response(
                {'error': 'Archivo y origen son requeridos'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        semestre_actual = Semestre.objects.filter(activo_para_carga=True).first()
        if not semestre_actual:
            return Response(
                {'error': 'No hay un semestre activo para la carga.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            if origen == 'CEAT':
                IngestaService.procesar_ceat(archivo, semestre_actual)
            elif origen == 'Evaluación Docente':
                IngestaService.procesar_evaluacion_docente(archivo, semestre_actual)
            elif origen == 'Control Docente':
                IngestaService.procesar_control_docente(archivo, semestre_actual)
            elif origen == 'PENSUM':
                msg = IngestaService.procesar_pensum(archivo)
                return Response({'status': 'success', 'message': msg})
            elif origen == 'NOMINA':
                msg = IngestaService.procesar_nomina(archivo, semestre_actual)
                return Response({'status': 'success', 'message': msg})
            else:
                return Response(
                    {'error': f'Origen "{origen}" no soportado.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            return Response({
                'status': 'success', 
                'message': f'Datos de {origen} procesados correctamente.'
            })
        except Exception as e:
            return Response(
                {'status': 'error', 'message': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
