import pandas as pd
import re
from evaluaciones.parsers.base_parser import BaseParser

class ComentariosParser(BaseParser):
    @classmethod
    def procesar(cls, archivo, semestre):
        """
        Procesa un archivo Excel de comentarios.
        Basado en la inspección:
        - Docente: Se encuentra en una columna (usualmente Unnamed: 1) con formato (codigo) Nombre
        - Comentario: Se encuentra en la columna Unnamed: 4 (índice 4)
        """
        df = pd.read_excel(archivo)
        
        docente_actual = None
        codigo_actual = None
        comentarios_acumulados = []

        print("--- Iniciando extracción de comentarios ---")

        for i, fila in df.iterrows():
            # Buscamos si en alguna celda de la fila está el patrón del docente
            docente_detectado = False
            for col_idx, valor_celda in enumerate(fila):
                valor_str = str(valor_celda).strip()
                if pd.isna(valor_celda) or valor_str.lower() == 'nan':
                    continue
                
                match = re.search(r'\((\d+)\)\s*(.*)', valor_str)
                if match:
                    # Si ya teníamos un docente, procesamos sus comentarios
                    if docente_actual and comentarios_acumulados:
                        cls.mostrar_comentarios(codigo_actual, docente_actual, comentarios_acumulados)
                    
                    codigo_actual = match.group(1)
                    docente_actual = match.group(2).strip()
                    comentarios_acumulados = []
                    docente_detectado = True
                    
                    # NUEVO: Verificar si hay un comentario en esta MISMA fila (columna índice 4)
                    if len(fila) > 4:
                        comentario_mismo_nivel = str(fila.iloc[4]).strip()
                        if comentario_mismo_nivel and not pd.isna(fila.iloc[4]) and comentario_mismo_nivel.lower() not in ['nan', 'comentario']:
                            comentarios_acumulados.append(comentario_mismo_nivel)
                            
                    break # Salimos del loop de columnas si encontramos al docente
            
            if docente_detectado:
                continue

            # Si no es fila de docente, buscamos comentarios en la columna Unnamed: 4 (índice 4)
            if len(fila) > 4:
                comentario = str(fila.iloc[4]).strip()
                if comentario and not pd.isna(fila.iloc[4]) and comentario.lower() != 'nan' and comentario.lower() != 'comentario':
                    if docente_actual:
                        comentarios_acumulados.append(comentario)
        
        # Mostrar el último docente procesado
        if docente_actual and comentarios_acumulados:
            cls.mostrar_comentarios(codigo_actual, docente_actual, comentarios_acumulados)
            
        print("--- Fin de la extracción ---")

    @classmethod
    def mostrar_comentarios(cls, codigo, nombre, comentarios):
        print(f"\nDocente: {nombre} ({codigo})")
        print(f"Total comentarios: {len(comentarios)}")
        for i, comentario in enumerate(comentarios, 1):
            # Limpiamos posibles saltos de línea internos para la consola
            limpio = " ".join(comentario.split())
            print(f"  {i}. {limpio}")
