import pandas as pd
from evaluaciones.parsers.base_parser import BaseParser

class ControlDocenteParser(BaseParser):
    @classmethod
    def procesar(cls, archivo, semestre):
        df = pd.read_excel(archivo)
        
        # Palabras clave para identificar columnas de calificación (asistencia, tareas, etc.)
        keywords = ['asistencia', 'zonas', 'programa', 'portal', 'actas', 'propuesta']
        
        for _, fila in df.iterrows():
            nombre_docente = fila.get('Docente')
            if pd.isna(nombre_docente): continue
            
            # 1. Buscar Código
            codigo_raw = fila.get('Código') or fila.get('Código Docente') or fila.get('Carné')
            codigo = cls.extraer_codigo_docente(codigo_raw)
            
            # 2. Calcular promedio de columnas de control dinámicamente
            notas_control = []
            for col in df.columns:
                col_lower = col.lower()
                # Si la columna contiene alguna palabra clave, tomamos su valor
                if any(k in col_lower for k in keywords):
                    val = pd.to_numeric(fila.get(col), errors='coerce')
                    if not pd.isna(val):
                        notas_control.append(val)
            
            # Promedio de las columnas de control encontradas
            promedio_control = sum(notas_control) / len(notas_control) if notas_control else 0
            
            # Prioridad: Si ya existe una columna de "Evaluación" ya calculada, la usamos
            # (A veces los coordinadores ya ponen el total ahí)
            nota_final = fila.get('Evaluación desde la coordinación') or fila.get('Evaluación del desempeño') or promedio_control
            
            if pd.isna(nota_final):
                nota_final = promedio_control

            # 3. Guardar en BD
            curso = fila.get('Curso')
            seccion = str(fila.get('Sección')).split('.')[0] if not pd.isna(fila.get('Sección')) else None
            
            cls.guardar_nota_en_bd(
                codigo, 
                'Control Docente', 
                nota_final, 
                semestre, 
                nombre_curso=curso, 
                seccion=seccion, 
                docente_obj=nombre_docente
            )
