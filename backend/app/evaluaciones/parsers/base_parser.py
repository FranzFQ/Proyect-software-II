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
        # 0. ASEGURAR FACULTAD (Requerido por develop)
        facultad_default, _ = Facultad.objects.get_or_create(nombre="Facultad Ingeniería")

        # 1. IDENTIFICAR O CREAR DOCENTE
        docente = None
        if isinstance(docente_obj, Docente):
            docente = docente_obj
        
        if not docente and (codigo_docente or docente_obj):
            nombre_docente = str(docente_obj) if docente_obj and isinstance(docente_obj, str) else f"Docente {codigo_docente}"
            final_codigo = str(codigo_docente) if codigo_docente else f"TEMP-{nombre_docente[:10]}"
            docente, created = Docente.objects.get_or_create(
                codigo_docente=final_codigo,
                defaults={
                    'nombre_completo': nombre_docente,
                    'facultad': facultad_default
                }
            )
            if created: print(f"  [+] Docente creado: {nombre_docente}")

        if not docente: return 

        # 2. IDENTIFICAR O CREAR CURSO (Independiente de la nota)
        curso_dado = None
        if nombre_curso:
            # Buscamos o creamos la Carrera y Pensum (Asegurando Facultad)
            carrera, _ = Carrera.objects.get_or_create(
                nombre="Carrera Ingeniería", 
                defaults={'facultad': facultad_default}
            )
            pensum, _ = Pensum.objects.get_or_create(
                nombre="Pensum General", 
                carrera=carrera
            )
            
            # Buscamos o creamos el Curso (catálogo)
            curso_obj, _ = Curso.objects.get_or_create(
                nombre_curso=str(nombre_curso).strip(),
                pensum=pensum,
                defaults={'creditos': 0}
            )
            
            # Buscamos o creamos el CursoDado (instancia docente-semestre-seccion)
            sec_str = str(seccion).split('.')[0].strip() if seccion and not pd.isna(seccion) else "A"
            curso_dado, created = CursoDado.objects.get_or_create(
                docente=docente,
                curso=curso_obj,
                semestre=semestre,
                seccion=sec_str
            )
            if created: print(f"  [+] Curso registrado: {nombre_curso} ({sec_str})")

        # 3. GUARDAR NOTA DIRECTA (YAGNI: Sin detalles, solo promedios)
        if nota is None or pd.isna(nota): return

        criterio = CriterioEvaluacion.objects.filter(nombre__icontains=nombre_criterio).first()
        if not criterio:
            print(f"  [!] CRITERIO NO ENCONTRADO: '{nombre_criterio}'. No se puede clasificar la nota.")
            return

        if criterio.alcance == 'GLOBAL':
            eval_consolidada, _ = EvaluacionConsolidada.objects.get_or_create(
                docente=docente, 
                semestre=semestre
            )
            eval_consolidada.puntaje_final = float(nota)
            eval_consolidada.save()
        elif criterio.alcance == 'CURSO' and curso_dado:
            eval_curso, _ = EvaluacionCurso.objects.get_or_create(
                curso_dado=curso_dado
            )
            eval_curso.puntaje_curso = float(nota)
            eval_curso.save()
