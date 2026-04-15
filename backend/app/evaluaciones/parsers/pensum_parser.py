import pandas as pd
from academico.models import Carrera, Pensum, Curso

class PensumParser:
    @classmethod
    def procesar(cls, archivo):
        # El archivo XLS tiene los headers en la fila 5 (indice 0-based seria 5 si usamos skiprows=5)
        # Segun la inspeccion anterior, skiprows=5 mostraba los nombres de las columnas
        df = pd.read_excel(archivo, skiprows=5)
        
        # Limpiar filas vacias
        df = df.dropna(subset=['Nombre_Carrera', 'Nombre_Curso', 'No_Pensum'])

        objetos_creados = 0
        for _, fila in df.iterrows():
            nombre_carrera = str(fila['Nombre_Carrera']).strip()
            nombre_curso = str(fila['Nombre_Curso']).strip()
            no_pensum = str(fila['No_Pensum']).strip()
            creditos = int(fila.get('Cred_Teo', 0)) + int(fila.get('Cred_Pra', 0))

            # 1. Obtener o crear Carrera
            carrera, _ = Carrera.objects.get_or_create(nombre=nombre_carrera)

            # 2. Obtener o crear Pensum
            pensum, _ = Pensum.objects.get_or_create(
                nombre=no_pensum,
                carrera=carrera
            )

            # 3. Obtener o crear Curso
            curso, created = Curso.objects.get_or_create(
                pensum=pensum,
                nombre_curso=nombre_curso,
                defaults={'creditos': creditos}
            )
            
            if not created:
                curso.creditos = creditos
                curso.save()
                
            objetos_creados += 1

        return f"Procesado exitosamente: {objetos_creados} cursos actualizados/creados."
