import pandas as pd
from evaluaciones.parsers.base_parser import BaseParser

class CEATParser(BaseParser):
    @classmethod
    def procesar(cls, archivo, semestre):
        df = pd.read_excel(archivo, skiprows=7)
        for _, fila in df.iterrows():
            if pd.isna(fila.get('Código Docente')) or pd.isna(fila.get('Nombre(s) y Apellidos')):
                continue
            codigo = cls.extraer_codigo_docente(fila.get('Código Docente'))
            cls.guardar_nota_en_bd(codigo, 'Capacitaciones CEAT', 100, semestre)
