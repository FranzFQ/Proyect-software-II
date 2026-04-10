import pandas as pd
from evaluaciones.parsers.base_parser import BaseParser

class ControlDocenteParser(BaseParser):
    @classmethod
    def procesar(cls, archivo, semestre):
        df = pd.read_excel(archivo)
        cols_asistencia = [
            'Asistencia reunón facultad 19 junio', 'Programa actualizado\n8 de julio',
            'Configuración de notas\n8 de julio', 'Asistencia actualizada por sesión en el portal',
            'Uso del portal académico ', 'Zonas al 20%\n23 de agosto',
            'Zonas al 30%\n17 de septiembre', 'Zonas al 40%\n27 de septiembre',
            'Zonas al 60%\n24 de octubre', 'Envío de propuestas de examen\n3 días hábiles',
            'Actas de primera y segunda convocatoria\n3 días hábiles'
        ]
        for _, fila in df.iterrows():
            nombre_docente = fila.get('Docente')
            if pd.isna(nombre_docente): continue
            docente_obj = cls.buscar_docente_por_nombre(nombre_docente)
            valores = pd.to_numeric([fila.get(c) for c in cols_asistencia if c in fila], errors='coerce')
            valores_validos = valores[~pd.isna(valores)]
            promedio = valores_validos.mean() if len(valores_validos) > 0 else 0
            curso = fila.get('Curso')
            seccion = fila.get('Sección')
            cls.guardar_nota_en_bd(None, 'Criterios de Coordinador', promedio, semestre, 
                              nombre_curso=curso, seccion=seccion, docente_obj=docente_obj)
