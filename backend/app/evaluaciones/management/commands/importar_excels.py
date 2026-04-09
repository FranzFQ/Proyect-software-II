import os
from django.core.management.base import BaseCommand
from academico.models import Semestre
from evaluaciones.views import (
    procesar_ceat_logic, 
    procesar_evaluacion_docente_logic, 
    procesar_control_docente_logic
)

class Command(BaseCommand):
    help = 'Importa datos de archivos Excel locales en la carpeta backend/Excels/'

    def handle(self, *args, **options):
        # 1. Obtener la ruta de la carpeta Excels
        # Estamos en: backend/app/evaluaciones/management/commands/importar_excels.py
        # Subimos 5 niveles para llegar a la carpeta 'backend/'
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
            'CEAT.xlsx': procesar_ceat_logic,
            'Evaluación Docente.xlsx': procesar_evaluacion_docente_logic,
            'Control docente.xlsx': procesar_control_docente_logic,
        }

        for nombre, funcion in archivos.items():
            ruta = os.path.join(excels_dir, nombre)
            if os.path.exists(ruta):
                self.stdout.write(self.style.MIGRATE_HEADING(f'\n>>> IMPORTANDO: {nombre}'))
                try:
                    funcion(ruta, semestre)
                    self.stdout.write(self.style.SUCCESS(f'Completado: {nombre}'))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Error en {nombre}: {e}'))
            else:
                self.stdout.write(self.style.WARNING(f'Archivo no encontrado: {ruta}'))
