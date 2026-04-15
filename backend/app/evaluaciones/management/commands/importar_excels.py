import os
from django.core.management.base import BaseCommand
from academico.models import Semestre
from evaluaciones.services.ingesta_service import IngestaService

class Command(BaseCommand):
    help = 'Importa datos de archivos Excel locales en la carpeta backend/Excels/'

    def handle(self, *args, **options):
        # 1. Obtener la ruta de la carpeta Excels
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
        excels_dir = os.path.join(backend_dir, 'Excels')

        self.stdout.write(self.style.SUCCESS(f'Buscando archivos en: {excels_dir}'))

        # 2. Verificar semestre activo
        semestre = Semestre.objects.filter(activo_para_carga=True).first()
        if not semestre:
            self.stdout.write(self.style.ERROR('No hay un semestre activo para carga. Abortando.'))
            return

        # 3. Procesar archivos específicos
        archivos = {
            'Pensum.xlsx': IngestaService.procesar_pensum,
            'Nomina.xlsx': IngestaService.procesar_nomina,
            'CEAT.xlsx': IngestaService.procesar_ceat,
            'Evaluación Docente.xlsx': IngestaService.procesar_evaluacion_docente,
            'Control docente.xlsx': IngestaService.procesar_control_docente,
        }

        for nombre, funcion in archivos.items():
            ruta = os.path.join(excels_dir, nombre)
            if os.path.exists(ruta):
                self.stdout.write(self.style.MIGRATE_HEADING(f'\n>>> IMPORTANDO: {nombre}'))
                try:
                    # Pensum no requiere semestre, los demas si
                    if nombre == 'Pensum.xlsx':
                        resultado = funcion(ruta)
                    else:
                        resultado = funcion(ruta, semestre)
                    
                    self.stdout.write(self.style.SUCCESS(f'Completado: {nombre} ({resultado or ""})'))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Error en {nombre}: {e}'))
            else:
                self.stdout.write(self.style.WARNING(f'Archivo no encontrado: {ruta}'))
