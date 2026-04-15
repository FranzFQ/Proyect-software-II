from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from evaluaciones.services.ingesta_service import IngestaService
from academico.models import Semestre

class IngestaViewSet(viewsets.ViewSet):
    """
    ViewSet para manejar la carga y procesamiento de archivos Excel/CSV 
    usando los servicios de ingesta existentes.
    """
    parser_classes = (MultiPartParser, FormParser)

    @action(detail=False, methods=['post'], url_path='subir-archivo')
    def subir_archivo(self, request):
        tipo = request.data.get('tipo') # 'ceat', 'evaluacion_docente', 'control_docente', etc.
        archivo = request.FILES.get('archivo')
        
        if not tipo or not archivo:
            return Response(
                {'error': 'Se requiere el tipo de archivo y el archivo adjunto (archivo).'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Buscamos el semestre activo para la carga
        semestre = Semestre.objects.filter(activo_para_carga=True).first()
        if not semestre:
            return Response(
                {'error': 'No hay un semestre activo configurado para recibir carga de datos.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            if tipo == 'ceat':
                IngestaService.procesar_ceat(archivo, semestre)
            elif tipo == 'evaluacion_docente':
                IngestaService.procesar_evaluacion_docente(archivo, semestre)
            elif tipo == 'control_docente':
                IngestaService.procesar_control_docente(archivo, semestre)
            else:
                return Response(
                    {'error': f'El tipo de archivo "{tipo}" no está soportado aún por el motor de ingesta.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            return Response(
                {'message': f'Archivo de {tipo} procesado exitosamente para el semestre {semestre}.'}, 
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {'error': f'Error al procesar el archivo: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
