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
        - Docente: (codigo) Nombre
        - Curso: Nombre del curso en las primeras columnas.
        - Comentario: Columna índice 4.
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
            # Esto evita que palabras en el comentario (col 4) activen detecciones falsas
            identificacion_str = " ".join([str(fila.iloc[c]) for c in range(min(4, len(fila))) if not pd.isna(fila.iloc[c])])
            
            # 2. DETECCIÓN DE DOCENTE
            match_docente = re.search(r'\((\d+)\)\s*(.*)', identificacion_str)
            
            if match_docente:
                # Si ya veníamos procesando algo, guardamos el bloque anterior
                if docente_actual and comentarios_acumulados:
                    cls.guardar_comentarios_db(codigo_actual, docente_actual, curso_actual or "CURSO NO DETECTADO", comentarios_acumulados, semestre, tipo_comentarios)
                
                codigo_actual = match_docente.group(1)
                docente_actual = match_docente.group(2).strip()
                curso_actual = None 
                comentarios_acumulados = []
                
                # Intentar ver si el curso está en esta misma fila del docente
                posibles = CursoDado.objects.filter(docente__codigo_docente=codigo_actual, semestre=semestre)
                for asignacion in posibles:
                    if asignacion.curso.nombre_curso.lower() in identificacion_str.lower():
                        curso_actual = asignacion.curso.nombre_curso
                        break
            
            # 3. DETECCIÓN DE CURSO (Solo si ya tenemos docente y no detectamos un nuevo docente en esta fila)
            elif docente_actual:
                posibles_cursos = CursoDado.objects.filter(docente__codigo_docente=codigo_actual, semestre=semestre)
                for asignacion in posibles_cursos:
                    if asignacion.curso.nombre_curso.lower() in identificacion_str.lower():
                        # Si el curso detectado es diferente al que llevamos, guardamos y cambiamos
                        if curso_actual != asignacion.curso.nombre_curso:
                            if comentarios_acumulados:
                                cls.guardar_comentarios_db(codigo_actual, docente_actual, curso_actual or "CURSO NO DETECTADO", comentarios_acumulados, semestre, tipo_comentarios)
                                comentarios_acumulados = []
                            curso_actual = asignacion.curso.nombre_curso
                        break

            # 4. EXTRACCIÓN DE COMENTARIO (Se ejecuta para TODAS las filas que tengan contenido en col 4)
            if len(fila) > 4 and docente_actual:
                comentario = str(fila.iloc[4]).strip()
                # Validar que sea un comentario real y no basura o encabezados
                if comentario and not pd.isna(fila.iloc[4]) and comentario.lower() not in ['nan', 'comentario', 'comentarios', 'observaciones']:
                    comentarios_acumulados.append(comentario)
        
        # Guardar el último bloque al finalizar el archivo
        if docente_actual and comentarios_acumulados:
            cls.guardar_comentarios_db(codigo_actual, docente_actual, curso_actual or "CURSO NO DETECTADO", comentarios_acumulados, semestre, tipo_comentarios)
            
        print("--- Fin del procesamiento ---")

    @classmethod
    def guardar_comentarios_db(cls, codigo, nombre, nombre_curso, comentarios, semestre, tipo_obj):
        docente = Docente.objects.filter(codigo_docente=codigo).first()
        if not docente:
            docente = Docente.objects.filter(nombre_completo__icontains=nombre).first()
            
        print(f"\n" + "="*60)
        if not docente:
            print(f"DOCENTE: {nombre} [!] (NO ENCONTRADO EN BD)")
        else:
            print(f"DOCENTE: {docente.nombre_completo} ({docente.codigo_docente})")
        
        print(f"CURSO:   {nombre_curso}")

        curso_dado = None
        if docente:
            curso_dado = CursoDado.objects.filter(
                docente=docente, 
                semestre=semestre, 
                curso__nombre_curso__icontains=nombre_curso
            ).first()
        
        if not curso_dado:
            print(f"  [!] No se pudo vincular a un curso registrado. No se guardará en BD.")
        
        print(f"TOTAL COMENTARIOS: {len(comentarios)}")
        print("-" * 30)
        for i, c in enumerate(comentarios, 1):
            limpio = " ".join(c.split())
            print(f"  {i}. {limpio}")

        if curso_dado:
            analisis, created = AnalisisTexto.objects.get_or_create(
                curso_dado=curso_dado,
                tipo=tipo_obj,
                defaults={'contenido': []}
            )
            nuevos = [c for c in comentarios if c not in analisis.contenido]
            if nuevos:
                analisis.contenido.extend(nuevos)
                analisis.save()
                print(f"  [+] {len(nuevos)} comentarios guardados en: {curso_dado.curso.nombre_curso}")
            else:
                print(f"  [~] Sin comentarios nuevos (ya existían).")
        
        print("="*60)
