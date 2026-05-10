import pandas as pd
import re
import unicodedata
from usuarios.models import Docente
from evaluaciones.models import (
    CursoDado, CriterioEvaluacion, 
    EvaluacionConsolidada, EvaluacionCurso
)
from academico.models import Facultad, Carrera, Pensum, Curso

def normalizar_texto(texto):
    if not texto or pd.isna(texto):
        return ""
    texto = str(texto).strip()
    texto = unicodedata.normalize('NFD', texto)
    return "".join([c for c in texto if not unicodedata.combining(c)]).upper()

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
        # 0. ASEGURAR FACULTAD (Sin duplicar)
        facultad_default = Facultad.objects.filter(nombre__icontains="Ingenier").first()
        
        if not facultad_default:
            facultad_default = Facultad.objects.first()
            
        if not facultad_default:
            facultad_default = Facultad.objects.create(nombre="Ingeniería")

        # 1. IDENTIFICAR O CREAR DOCENTE
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
                docente = Docente.objects.create(
                    codigo_docente=final_codigo if final_codigo else f"TEMP-{nombre_docente_str[:10]}",
                    nombre_completo=nombre_docente_str,
                    facultad=facultad_default
                )
                print(f"  [+] Docente creado (no encontrado): {nombre_docente_str}")

        if not docente: return 

        # 2. IDENTIFICAR O BUSCAR CURSO
        curso_dado = None
        if nombre_curso:
            nombre_curso_limpio = str(nombre_curso).strip()
            nombre_norm = normalizar_texto(nombre_curso_limpio)
            
            # Intentamos buscar el curso en el catálogo con normalización
            # Primero buscamos coincidencias que contengan el nombre o viceversa
            cursos = Curso.objects.all()
            curso_obj = None
            for c in cursos:
                if normalizar_texto(c.nombre_curso) == nombre_norm:
                    curso_obj = c
                    break
            
            if not curso_obj:
                for c in cursos:
                    if nombre_norm in normalizar_texto(c.nombre_curso) or normalizar_texto(c.nombre_curso) in nombre_norm:
                        curso_obj = c
                        break
            
            # Si el curso no existe, lo creamos usando estructuras EXISTENTES
            if not curso_obj:
                pensum = Pensum.objects.first()
                if not pensum:
                    carrera, _ = Carrera.objects.get_or_create(
                        nombre="Carrera Ingeniería", 
                        defaults={'facultad': facultad_default}
                    )
                    pensum, _ = Pensum.objects.get_or_create(
                        nombre="Pensum General", 
                        carrera=carrera
                    )
                
                curso_obj, _ = Curso.objects.get_or_create(
                    nombre_curso=nombre_curso_limpio,
                    pensum=pensum,
                    defaults={'creditos': 0}
                )
            
            # Buscamos o creamos el CursoDado
            sec_str = str(seccion).split('.')[0].strip() if seccion and not pd.isna(seccion) else "A"
            curso_dado, created = CursoDado.objects.get_or_create(
                docente=docente,
                curso=curso_obj,
                semestre=semestre,
                seccion=sec_str
            )
            if created: print(f"  [+] Curso registrado: {nombre_curso_limpio} ({sec_str})")

        # 3. GUARDAR NOTA DIRECTA
        if nota is None or pd.isna(nota): return

        criterio = CriterioEvaluacion.objects.filter(nombre__icontains=nombre_criterio).first()

        if not criterio:
            alcance_nuevo = 'GLOBAL' if 'CEAT' in nombre_criterio.upper() else 'CURSO'
            criterio = CriterioEvaluacion.objects.create(
                nombre=nombre_criterio,
                alcance=alcance_nuevo
            )
            print(f"  [+] Criterio creado automáticamente: {nombre_criterio} ({alcance_nuevo})")

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
