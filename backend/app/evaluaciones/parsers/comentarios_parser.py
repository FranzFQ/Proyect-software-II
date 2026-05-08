import pandas as pd
import re
from evaluaciones.parsers.base_parser import BaseParser
from evaluaciones.models import AnalisisTexto, Tipo, CursoDado, EvaluacionConsolidada
from usuarios.models import Docente
from academico.models import Curso

from ai.models import SummaryState
from ai.tasks import generar_resumen

class ComentariosParser(BaseParser):
    @classmethod
    def procesar(cls, archivo, semestre):
        """
        Procesa un archivo Excel de comentarios con lógica de captura continua.
        """
        df = pd.read_excel(archivo)
        
        docente_actual = None  # Objeto Docente
        nombre_docente_str = None
        codigo_docente_str = None
        curso_actual = None    # Objeto CursoDado
        nombre_curso_str = None
        comentarios_acumulados = []

        print("--- Iniciando extracción de comentarios (Versión Corregida) ---")

        tipo_comentarios, _ = Tipo.objects.get_or_create(nombre='COMENTARIOS')

        for i, fila in df.iterrows():
            # 1. Identificación de la fila (columnas 0 a 3)
            identificacion_texto = " ".join([str(fila.iloc[c]) for c in range(min(4, len(fila))) if not pd.isna(fila.iloc[c])])
            
            # 2. ¿HAY UN DOCENTE EN ESTA FILA?
            match_docente = re.search(r'\((\d+)\)\s*(.*)', identificacion_texto)
            if match_docente:
                # Guardar bloque anterior si existía
                if (docente_actual or nombre_docente_str) and comentarios_acumulados:
                    cls.guardar_comentarios_db(docente_actual, nombre_docente_str, codigo_docente_str, 
                                            curso_actual, nombre_curso_str, 
                                            comentarios_acumulados, semestre, tipo_comentarios)
                
                # Resetear para el nuevo docente
                codigo_docente_str = match_docente.group(1)
                nombre_docente_str = match_docente.group(2).strip()
                docente_actual = Docente.objects.filter(codigo_docente=codigo_docente_str).first()
                curso_actual = None
                nombre_curso_str = None
                comentarios_acumulados = []

            # 3. ¿HAY UN CURSO EN ESTA FILA? (Solo si ya tenemos un docente identificado)
            if (docente_actual or nombre_docente_str):
                # Buscamos coincidencias con nombres de cursos reales en la BD para este docente
                asig_encontrada = None
                if docente_actual:
                    asignaciones = CursoDado.objects.filter(docente=docente_actual, semestre=semestre)
                    for asig in asignaciones:
                        if asig.curso.nombre_curso.lower() in identificacion_texto.lower():
                            asig_encontrada = asig
                            break
                
                # Si encontramos un curso y es distinto al actual, guardamos lo que llevábamos
                if asig_encontrada and (not curso_actual or asig_encontrada.id != curso_actual.id):
                    if comentarios_acumulados:
                        cls.guardar_comentarios_db(docente_actual, nombre_docente_str, codigo_docente_str, 
                                                curso_actual, nombre_curso_str, 
                                                comentarios_acumulados, semestre, tipo_comentarios)
                        comentarios_acumulados = []
                    
                    curso_actual = asig_encontrada
                    nombre_curso_str = asig_encontrada.curso.nombre_curso
                
                # Fallback: Si no hay curso en BD pero la fila parece tener un nombre de curso (título)
                elif not asig_encontrada and len(identificacion_texto) > 0 and len(identificacion_texto) < 100:
                    # Si no hay comentario en la col 4, probablemente es solo un encabezado de curso
                    if len(fila) > 4 and pd.isna(fila.iloc[4]):
                        if nombre_curso_str and nombre_curso_str != identificacion_texto.strip() and comentarios_acumulados:
                            cls.guardar_comentarios_db(docente_actual, nombre_docente_str, codigo_docente_str, 
                                                    curso_actual, nombre_curso_str, 
                                                    comentarios_acumulados, semestre, tipo_comentarios)
                            comentarios_acumulados = []
                        nombre_curso_str = identificacion_texto.strip()
                        curso_actual = None

            # 4. EXTRACCIÓN DEL COMENTARIO (¡Sin saltar la fila!)
            if len(fila) > 4 and (docente_actual or nombre_docente_str):
                comentario = str(fila.iloc[4]).strip()
                if comentario and not pd.isna(fila.iloc[4]) and comentario.lower() not in ['nan', 'comentario', 'comentarios', 'observaciones']:
                    comentarios_acumulados.append(comentario)

        # 5. Guardar el último bloque al finalizar el archivo
        if (docente_actual or nombre_docente_str) and comentarios_acumulados:
            cls.guardar_comentarios_db(docente_actual, nombre_docente_str, codigo_docente_str, 
                                    curso_actual, nombre_curso_str, 
                                    comentarios_acumulados, semestre, tipo_comentarios)
            
        print("--- Fin del procesamiento ---")

    @classmethod
    def guardar_comentarios_db(cls, docente_obj, nombre_str, codigo_str, curso_obj, curso_str, comentarios, semestre, tipo_obj):
        print(f"\n" + "="*60)
        
        # Log de Docente
        if docente_obj:
            print(f"DOCENTE: {docente_obj.nombre_completo} ({docente_obj.codigo_docente})")
        else:
            print(f"DOCENTE: {nombre_str} ({codigo_str}) [!] NO REGISTRADO EN BD")
            
        # Log de Curso
        current_course_name = curso_obj.curso.nombre_curso if curso_obj else (curso_str or "CURSO NO DETECTADO")
        print(f"CURSO:   {current_course_name}")
        
        # Verificación de vínculo
        if not curso_obj:
            print(f"  [!] No se pudo vincular a un curso registrado. No se guardará en BD.")
            
        print(f"TOTAL COMENTARIOS: {len(comentarios)}")
        print("-" * 30)
        for i, c in enumerate(comentarios, 1):
            limpio = " ".join(c.split())
            print(f"  {i}. {limpio}")

        # Guardar en Base de Datos (AnalisisTexto)
        if curso_obj:
            analisis, created = AnalisisTexto.objects.get_or_create(
                curso_dado=curso_obj,
                tipo=tipo_obj,
                defaults={'contenido': []}
            )
            # Evitar duplicar comentarios si se vuelve a procesar el archivo
            nuevos = [c for c in comentarios if c not in analisis.contenido]
            if nuevos:
                analisis.contenido.extend(nuevos)
                analisis.save()

                print(f"  [+] {len(nuevos)} comentarios guardados exitosamente en la BD.")
            else:
                print(f"  [~] Comentarios ya existentes en la BD.")
            
            status = SummaryState.objects.filter(
                evaluacion = EvaluacionConsolidada.objects.filter(docente=curso_obj.docente, semestre=semestre).first(),
                analisis = analisis
            ).first()
            if not status:
                SummaryState.objects.create(
                    evaluacion = EvaluacionConsolidada.objects.filter(docente=curso_obj.docente, semestre=semestre).first(),
                    analisis = analisis,
                    status = SummaryState.Status.PENDING
                )
                generar_resumen(analisis.id)

        
        print("="*60)
