import pandas as pd
from evaluaciones.parsers.base_parser import BaseParser

class EvaluacionDocenteParser(BaseParser):
    @classmethod
    def procesar(cls, archivo, semestre):
        # El archivo Evaluación Docente.xlsx empieza en la fila 11 (headers)
        df = pd.read_excel(archivo, skiprows=11)
        
        for _, fila in df.iterrows():
            # Limpiamos nombres de columnas quitando espacios para búsqueda flexible
            # Pero mantenemos acceso directo si conocemos el nombre exacto del Excel inspeccionado
            codigo_raw = fila.get(' Código') or fila.get('Código')
            codigo = cls.extraer_codigo_docente(codigo_raw)
            
            nombre = fila.get('Catedrático') or fila.get('Nombre') or fila.get('Docente')
            nota = fila.get('Resultado') or fila.get(' Resultado')
            
            if codigo and not pd.isna(nota):
                curso = fila.get('Curso')
                seccion = fila.get(' Sección') or fila.get('Sección')
                
                cls.guardar_nota_en_bd(
                    codigo, 
                    'Evaluaciones Estudiantes', 
                    nota, 
                    semestre, 
                    nombre_curso=curso, 
                    seccion=seccion, 
                    docente_obj=nombre
                )
