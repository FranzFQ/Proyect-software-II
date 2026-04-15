import pandas as pd
from evaluaciones.parsers.base_parser import BaseParser

class ControlDocenteParser(BaseParser):
    @classmethod
    def procesar(cls, archivo, semestre):
        df = pd.read_excel(archivo)
        
        # Palabras clave para identificar columnas de calificación (asistencia, tareas, etc.)
        keywords = ['asistencia', 'zonas', 'programa', 'portal', 'actas', 'propuesta', 'notas']
        
        for _, fila in df.iterrows():
            nombre_docente = fila.get('Docente')
            if pd.isna(nombre_docente): continue
            
            # 1. Buscar Código
            codigo_raw = fila.get('Código') or fila.get('Código Docente') or fila.get('Carné')
            codigo = cls.extraer_codigo_docente(codigo_raw)
            
            # 2. Calcular promedio de cumplimiento (Escala 0-1)
            puntos_obtenidos = []
            for col in df.columns:
                col_lower = str(col).lower()
                # Si la columna contiene alguna palabra clave de las preguntas del coordinador
                if any(k in col_lower for k in keywords):
                    val = pd.to_numeric(fila.get(col), errors='coerce')
                    if not pd.isna(val):
                        puntos_obtenidos.append(float(val))
            
            # Calculamos el promedio de cumplimiento (ej: 0.85)
            promedio_cumplimiento = sum(puntos_obtenidos) / len(puntos_obtenidos) if puntos_obtenidos else 0
            
            # Convertimos a escala 0-100%
            nota_final = round(promedio_cumplimiento * 100, 2)
            
            # 3. Guardar en BD
            curso = fila.get('Curso')
            seccion = str(fila.get('Sección')).split('.')[0] if not pd.isna(fila.get('Sección')) else "1"
            
            cls.guardar_nota_en_bd(
                codigo, 
                'Control Docente', 
                nota_final, 
                semestre, 
                nombre_curso=curso, 
                seccion=seccion, 
                docente_obj=nombre_docente
            )
