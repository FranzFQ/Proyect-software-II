import pandas as pd
import re
from evaluaciones.parsers.base_parser import BaseParser
from evaluaciones.models import AnalisisTexto, Tipo, CursoDado
from usuarios.models import Docente
from academico.models import Curso

class ComentariosParser(BaseParser):
    @classmethod
    def procesar(cls, archivo, semestre):
        """
        Procesa un archivo Excel de comentarios.
        - Docente: Se encuentra en una columna con formato (codigo) Nombre
        - Comentario: Se encuentra en la columna índice 4 (Unnamed: 4)
        """
        df = pd.read_excel(archivo)
        
        docente_actual = None
        codigo_actual = None
        comentarios_acumulados = []

        print("--- Iniciando extracción y guardado de comentarios ---")

        # Asegurar que el tipo 'COMENTARIOS' exista
        tipo_comentarios, _ = Tipo.objects.get_or_create(nombre='COMENTARIOS')

        for i, fila in df.iterrows():
            docente_detectado = False
            for col_idx, valor_celda in enumerate(fila):
                valor_str = str(valor_celda).strip()
                if pd.isna(valor_celda) or valor_str.lower() == 'nan':
                    continue
                
                match = re.search(r'\((\d+)\)\s*(.*)', valor_str)
                if match:
                    # Guardar comentarios del docente anterior antes de cambiar
                    if docente_actual and comentarios_acumulados:
                        cls.guardar_comentarios_db(codigo_actual, docente_actual, comentarios_acumulados, semestre, tipo_comentarios)
                    
                    codigo_actual = match.group(1)
                    docente_actual = match.group(2).strip()
                    comentarios_acumulados = []
                    docente_detectado = True
                    
                    # Verificar si hay comentario en la misma fila del nombre
                    if len(fila) > 4:
                        comentario_mismo_nivel = str(fila.iloc[4]).strip()
                        if comentario_mismo_nivel and not pd.isna(fila.iloc[4]) and comentario_mismo_nivel.lower() not in ['nan', 'comentario']:
                            comentarios_acumulados.append(comentario_mismo_nivel)
                    break
            
            if docente_detectado:
                continue

            if len(fila) > 4:
                comentario = str(fila.iloc[4]).strip()
                if comentario and not pd.isna(fila.iloc[4]) and comentario.lower() != 'nan' and comentario.lower() != 'comentario':
                    if docente_actual:
                        comentarios_acumulados.append(comentario)
        
        # Guardar el último docente
        if docente_actual and comentarios_acumulados:
            cls.guardar_comentarios_db(codigo_actual, docente_actual, comentarios_acumulados, semestre, tipo_comentarios)
            
        print("--- Fin del procesamiento ---")

    @classmethod
    def guardar_comentarios_db(cls, codigo, nombre, comentarios, semestre, tipo_obj):
        # 1. Intentar buscar al docente
        docente = Docente.objects.filter(codigo_docente=codigo).first()
        if not docente:
            docente = Docente.objects.filter(nombre_completo__icontains=nombre).first()
            
        print(f"\n" + "="*60)
        if not docente:
            print(f"DOCENTE: {nombre} [!] (NO ENCONTRADO EN BASE DE DATOS)")
            print(f"CÓDIGO:  {codigo}")
        else:
            print(f"DOCENTE: {docente.nombre_completo}")
            print(f"CÓDIGO:  {docente.codigo_docente}")
        
        # 2. Buscar asignaciones solo si el docente existe
        asignaciones = None
        if docente:
            asignaciones = CursoDado.objects.filter(docente=docente, semestre=semestre)
            if not asignaciones.exists():
                print(f"CURSO:   [!] No tiene cursos asignados en este semestre")
            else:
                cursos_nombres = ", ".join([ad.curso.nombre_curso for ad in asignaciones])
                print(f"CURSO(S): {cursos_nombres}")
        else:
            print(f"CURSO:   [!] No se puede asociar (Docente no existe)")

        print(f"TOTAL COMENTARIOS: {len(comentarios)}")
        print("-" * 30)
        print("COMENTARIOS EXTRAÍDOS:")
        for i, c in enumerate(comentarios, 1):
            limpio = " ".join(c.split())
            print(f"  {i}. {limpio}")

        # 3. Guardar en la base de datos si es posible
        if docente and asignaciones and asignaciones.exists():
            for curso_dado in asignaciones:
                analisis, created = AnalisisTexto.objects.get_or_create(
                    curso_dado=curso_dado,
                    tipo=tipo_obj,
                    defaults={'contenido': []}
                )
                nuevos = [c for c in comentarios if c not in analisis.contenido]
                if nuevos:
                    analisis.contenido.extend(nuevos)
                    analisis.save()
        
        print("="*60)
