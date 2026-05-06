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
        Procesa un archivo Excel de comentarios con extracción optimizada.
        """
        df = pd.read_excel(archivo)
        
        docente_actual = None
        codigo_actual = None
        curso_actual = None
        comentarios_acumulados = []

        print("--- Iniciando extracción optimizada de comentarios ---")

        tipo_comentarios, _ = Tipo.objects.get_or_create(nombre='COMENTARIOS')

        for i, fila in df.iterrows():
            # 1. Obtener texto de las primeras 4 columnas (identificación)
            identificacion_str = " ".join([str(fila.iloc[c]) for c in range(min(4, len(fila))) if not pd.isna(fila.iloc[c])])
            
            # 2. DETECCIÓN DE DOCENTE
            match_docente = re.search(r'\((\d+)\)\s*(.*)', identificacion_str)
            
            if match_docente:
                if docente_actual and comentarios_acumulados:
                    cls.guardar_comentarios_db(codigo_actual, docente_actual, curso_actual or "CURSO NO DETECTADO", comentarios_acumulados, semestre, tipo_comentarios)
                
                codigo_actual = match_docente.group(1)
                docente_actual = match_docente.group(2).strip()
                curso_actual = None 
                comentarios_acumulados = []
                
                # Intentar detectar curso en la misma fila
                posibles = CursoDado.objects.filter(docente__codigo_docente=codigo_actual, semestre=semestre)
                for asignacion in posibles:
                    if asignacion.curso.nombre_curso.lower() in identificacion_str.lower():
                        curso_actual = asignacion.curso.nombre_curso
                        break
            
            # 3. DETECCIÓN DE CURSO
            elif docente_actual:
                posibles_cursos = CursoDado.objects.filter(docente__codigo_docente=codigo_actual, semestre=semestre)
                for asignacion in posibles_cursos:
                    if asignacion.curso.nombre_curso.lower() in identificacion_str.lower():
                        if curso_actual != asignacion.curso.nombre_curso:
                            if comentarios_acumulados:
                                cls.guardar_comentarios_db(codigo_actual, docente_actual, curso_actual or "CURSO NO DETECTADO", comentarios_acumulados, semestre, tipo_comentarios)
                                comentarios_acumulados = []
                            curso_actual = asignacion.curso.nombre_curso
                        break

            # 4. EXTRACCIÓN DE COMENTARIO (Columna 4)
            if len(fila) > 4 and docente_actual:
                comentario = str(fila.iloc[4]).strip()
                if comentario and not pd.isna(fila.iloc[4]) and comentario.lower() not in ['nan', 'comentario', 'comentarios', 'observaciones']:
                    comentarios_acumulados.append(comentario)
        
        if docente_actual and comentarios_acumulados:
            cls.guardar_comentarios_db(codigo_actual, docente_actual, curso_actual or "CURSO NO DETECTADO", comentarios_acumulados, semestre, tipo_comentarios)
            
        print("--- Fin del procesamiento de comentarios ---")

    @classmethod
    def guardar_comentarios_db(cls, codigo, nombre, nombre_curso, comentarios, semestre, tipo_obj):
        docente = Docente.objects.filter(codigo_docente=codigo).first()
        if not docente:
            docente = Docente.objects.filter(nombre_completo__icontains=nombre).first()
            
        curso_dado = None
        if docente:
            curso_dado = CursoDado.objects.filter(
                docente=docente, 
                semestre=semestre, 
                curso__nombre_curso__icontains=nombre_curso
            ).first()
        
        if curso_dado:
            analisis, created = AnalisisTexto.objects.get_or_create(
                curso_dado=curso_dado,
                tipo=tipo_obj,
                defaults={'contenido': []}
            )
            # Evitar duplicados
            nuevos = [c for c in comentarios if c not in analisis.contenido]
            if nuevos:
                analisis.contenido.extend(nuevos)
                analisis.save()
                print(f"  [+] {len(nuevos)} comentarios guardados para: {curso_dado.curso.nombre_curso}")
