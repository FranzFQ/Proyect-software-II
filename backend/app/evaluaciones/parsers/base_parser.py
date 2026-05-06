import pandas as pd
import re
from usuarios.models import Docente
from evaluaciones.models import (
    CursoDado, CriterioEvaluacion, 
    EvaluacionConsolidada, EvaluacionCurso
)
from academico.models import Facultad, Carrera, Pensum, Curso

class BaseParser:
    @staticmethod
    def extraer_codigo_docente(texto):
        if pd.isna(texto): return None
        match = re.search(r'\((\d+)\)', str(texto))
        if match:
            return match.group(1)
        return str(texto).strip().split('.')[0]

    @staticmethod
    def guardar_nota_en_bd(codigo_docente, nombre_criterio, nota, semestre, nombre_curso=None, seccion=None, docente_obj=None):
        # 1. IDENTIFICAR DOCENTE (Solo búsqueda)
        docente = None
        if isinstance(docente_obj, Docente):
            docente = docente_obj
        
        if not docente and (codigo_docente or docente_obj):
            final_codigo = str(codigo_docente).strip() if codigo_docente else None
            nombre_docente_str = str(docente_obj).strip() if docente_obj else f"Docente {final_codigo}"
            
            # Prioridad 1: Buscar por código exacto
            if final_codigo:
                docente = Docente.objects.filter(codigo_docente=final_codigo).first()
            
            # Prioridad 2: Buscar por nombre exacto
            if not docente and docente_obj:
                docente = Docente.objects.filter(nombre_completo__iexact=nombre_docente_str).first()
            
            # Prioridad 3: Buscar por nombre parcial
            if not docente and docente_obj:
                docente = Docente.objects.filter(nombre_completo__icontains=nombre_docente_str).first()
            
            if not docente:
                print(f"  [!] Docente no encontrado: {nombre_docente_str} ({final_codigo}). Nota de '{nombre_criterio}' omitida.")
                return

        if not docente: return 

        # 2. IDENTIFICAR CURSO Y ASIGNACIÓN (Solo búsqueda)
        curso_dado = None
        if nombre_curso:
            nombre_curso_limpio = str(nombre_curso).strip()
            
            # Intentamos buscar el curso en el catálogo (ya cargado por PensumParser)
            curso_obj = Curso.objects.filter(nombre_curso__icontains=nombre_curso_limpio).first()
            
            if not curso_obj:
                print(f"  [!] Curso no encontrado: {nombre_curso_limpio}. Nota de '{nombre_criterio}' omitida.")
                return
            
            # Buscamos la asignación (ya cargada por NominaParser)
            sec_str = str(seccion).split('.')[0].strip() if seccion and not pd.isna(seccion) else "A"
            curso_dado = CursoDado.objects.filter(
                docente=docente,
                curso=curso_obj,
                semestre=semestre,
                seccion=sec_str
            ).first()
            
            if not curso_dado:
                # Si no hay asignación específica, buscamos cualquier sección de ese curso para ese docente y semestre
                curso_dado = CursoDado.objects.filter(
                    docente=docente,
                    curso=curso_obj,
                    semestre=semestre
                ).first()
                
            if not curso_dado:
                print(f"  [!] Asignación no encontrada: {docente.nombre_completo} - {curso_obj.nombre_curso}. Nota omitida.")
                return

        # 3. GUARDAR NOTA DIRECTA
        if nota is None or pd.isna(nota): return

        # Aseguramos que el criterio exista (Auto-creación si falta, ya que es configuración)
        criterio = CriterioEvaluacion.objects.filter(nombre__icontains=nombre_criterio).first()

        if not criterio:
            alcance_nuevo = 'GLOBAL' if 'CEAT' in nombre_criterio.upper() else 'CURSO'
            criterio = CriterioEvaluacion.objects.create(
                nombre=nombre_criterio,
                alcance=alcance_nuevo
            )

        if criterio.alcance == 'GLOBAL':
            eval_consolidada, _ = EvaluacionConsolidada.objects.get_or_create(
                docente=docente, 
                semestre=semestre,
                criterio=criterio
            )
            eval_consolidada.puntaje_final = float(nota)
            eval_consolidada.save()
        elif criterio.alcance == 'CURSO' and curso_dado:
            eval_curso, _ = EvaluacionCurso.objects.get_or_create(
                curso_dado=curso_dado,
                criterio=criterio
            )
            eval_curso.puntaje_curso = float(nota)
            eval_curso.save()
