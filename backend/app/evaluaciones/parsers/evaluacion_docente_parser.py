import pandas as pd
from evaluaciones.parsers.base_parser import BaseParser

class EvaluacionDocenteParser(BaseParser):
    @classmethod
    def procesar(cls, archivo, semestre):
        df = pd.read_excel(archivo, skiprows=11)
        for _, fila in df.iterrows():
            col_codigo = ' Código' if ' Código' in df.columns else 'Código'
            col_resultado = 'Resultado' if 'Resultado' in df.columns else ' Resultado'
            col_seccion = ' Sección' if ' Sección' in df.columns else 'Sección'
            
            codigo = cls.extraer_codigo_docente(fila.get(col_codigo))
            nombre = fila.get('Nombre') or fila.get('Docente') or fila.get(' Nombres y Apellidos')
            nota = fila.get(col_resultado)
            
            if codigo and not pd.isna(nota):
                curso = fila.get('Curso')
                seccion = fila.get(col_seccion)
                cls.guardar_nota_en_bd(codigo, 'Evaluaciones Estudiantes', nota, semestre, 
                                  nombre_curso=curso, seccion=seccion, docente_obj=nombre)
