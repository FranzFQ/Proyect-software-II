import pandas as pd
from usuarios.models import Docente
from academico.models import Curso, Semestre, Facultad
from evaluaciones.models import CursoDado

class NominaParser:
    @classmethod
    def procesar(cls, archivo, semestre=None):
        # El archivo Nomina tiene los headers en la fila 10
        df = pd.read_excel(archivo, skiprows=10)
        
        # Eliminar columnas con todos NaN (limpiar un poco)
        df = df.dropna(axis=1, how='all')
        
        # Si no se provee semestre, usar el activo
        if not semestre:
            semestre = Semestre.objects.filter(activo_para_carga=True).first()
        
        if not semestre:
            return "Error: No hay un semestre activo para carga configurado."

        cursos_asignados = 0
        docente_actual = None
        codigo_actual = None
        facultad_actual = None

        for _, fila in df.iterrows():
            # Extraer valores, manejando posibles nombres de columnas
            # (El inspeccion_nomina.py nos mostro los nombres de las columnas que Pandas asigno si skiprows=10)
            # En la inspeccion: ['D', 'Título académico', 'Docente', 'Código  docente', ... 'Curso', 'Jornada', 'Sección', ... 'Total  de créditos']
            
            # Verificamos si la fila esta vacia o es un separador
            if pd.isna(fila.get('Curso')) and pd.isna(fila.get('Docente')) and pd.isna(fila.get('Código  docente')):
                continue

            # Propagar Docente, Codigo y Facultad si estan vacios (filas de multiples cursos para el mismo docente)
            docente_nombre = fila.get('Docente')
            codigo_docente = fila.get('Código  docente')
            nombre_facultad = fila.get('Facultad')

            if not pd.isna(docente_nombre):
                docente_actual = str(docente_nombre).strip()
            if not pd.isna(codigo_docente):
                codigo_actual = str(codigo_docente).strip().split('.')[0] # Quitar .0 si es float
            if not pd.isna(nombre_facultad):
                facultad_actual = str(nombre_facultad).strip()

            if not docente_actual or not codigo_actual:
                continue

            # 0. Obtener o crear Facultad si existe
            facultad_obj = None
            if facultad_actual:
                facultad_obj, _ = Facultad.objects.get_or_create(nombre=facultad_actual)

            # Datos del curso
            nombre_curso = str(fila.get('Curso')).strip()
            jornada = str(fila.get('Jornada')).strip()
            seccion = str(fila.get('Sección')).strip().split('.')[0]
            total_creditos = int(fila.get('Total  de créditos', 0))

            # 1. Obtener o crear Docente
            docente_obj, created = Docente.objects.get_or_create(
                codigo_docente=codigo_actual,
                defaults={
                    'nombre_completo': docente_actual,
                    'facultad': facultad_obj
                }
            )
            
            # Si el docente ya existia pero no tenia facultad, se la actualizamos
            if not created and facultad_obj and not docente_obj.facultad:
                docente_obj.facultad = facultad_obj
                docente_obj.save()

            # 2. Buscar el Curso (esto asume que el Pensum ya se cargo)
            # Si no existe, podriamos tener un "Pensum General" o algo similar?
            # Por ahora buscaremos por nombre_curso de forma flexible
            curso_obj = Curso.objects.filter(nombre_curso__icontains=nombre_curso).first()
            
            if not curso_obj:
                # Si no existe, podriamos crearlo en un pensum por defecto o arrojar warning
                # Por simplicidad en este parser, buscaremos el pensum mas reciente o el primero
                from academico.models import Pensum
                pensum_defecto = Pensum.objects.first()
                if pensum_defecto:
                    curso_obj = Curso.objects.create(
                        nombre_curso=nombre_curso,
                        pensum=pensum_defecto,
                        creditos=total_creditos
                    )
                else:
                    print(f"  [!] Salteado: Curso '{nombre_curso}' no tiene pensum base.")
                    continue

            # 3. Crear o actualizar CursoDado (Asignación)
            CursoDado.objects.update_or_create(
                curso=curso_obj,
                docente=docente_obj,
                semestre=semestre,
                seccion=seccion,
                defaults={'jornada': jornada}
            )
            
            cursos_asignados += 1

        return f"Nómina procesada: {cursos_asignados} cursos asignados para {semestre}."
