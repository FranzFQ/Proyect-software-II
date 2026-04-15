import pandas as pd
from evaluaciones.parsers.base_parser import BaseParser

class CEATParser(BaseParser):
    @classmethod
    def procesar(cls, archivo, semestre):
        df_full = pd.read_excel(archivo, header=None)
        
        start_row = -1
        idx_codigo = 1
        idx_nombre = 2
        idx_niveles = []

        # 1. Localización dinámica de encabezados
        for i, fila in df_full.iterrows():
            fila_str = [str(cell).lower().strip() for cell in fila]
            if any('nivel 1' in s for s in fila_str):
                start_row = i + 1
                for j, cell in enumerate(fila):
                    s = str(cell).lower().strip()
                    if 'código' in s: idx_codigo = j
                    if 'nombre' in s: idx_nombre = j
                    if 'nivel' in s or 'complementarias' in s:
                        idx_niveles.append(j)
                break

        # Fallback si falla la detección dinámica
        if start_row == -1:
            start_row, idx_niveles = 9, [5, 6, 7, 8]

        # 2. Extracción de datos
        datos_docentes = []
        max_horas = 0
        
        for i in range(start_row, len(df_full)):
            fila = df_full.iloc[i]
            
            # Validar que la fila contenga un nombre de docente
            nombre_raw = fila.iloc[idx_nombre]
            if pd.isna(nombre_raw) or str(nombre_raw).strip().lower() in ["nan", "", "none", "total"]:
                continue
            
            nombre = str(nombre_raw).strip()
            codigo = cls.extraer_codigo_docente(fila.iloc[idx_codigo])
            
            # Sumar niveles manualmente (5, 6, 7, 8)
            total_horas = 0
            for idx in idx_niveles:
                val = pd.to_numeric(fila.iloc[idx], errors='coerce')
                if not pd.isna(val):
                    total_horas += float(val)
            
            # Intentar usar columna 9 como respaldo si la suma dio 0
            if total_horas == 0 and len(fila) > 9:
                val_col9 = pd.to_numeric(fila.iloc[9], errors='coerce')
                if not pd.isna(val_col9):
                    total_horas = float(val_col9)

            if total_horas > 0:
                if total_horas > max_horas:
                    max_horas = total_horas
                datos_docentes.append({'codigo': codigo, 'nombre': nombre, 'horas': total_horas})

        # 3. Cálculo de nota relativa y guardado
        if not datos_docentes or max_horas == 0:
            return

        for doc in datos_docentes:
            # Curva de calificación: (Horas docente / Máximo grupo) * 100
            puntaje = (doc['horas'] / max_horas) * 100
            cls.guardar_nota_en_bd(
                doc['codigo'], 
                'Capacitaciones CEAT', 
                round(puntaje, 2), 
                semestre, 
                docente_obj=doc['nombre']
            )
        
        print(f"  [+] CEAT: Procesados {len(datos_docentes)} docentes exitosamente.")
