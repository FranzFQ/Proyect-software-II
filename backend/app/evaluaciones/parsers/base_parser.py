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
        # 0. ASEGURAR FACULTAD (Sin duplicar)
        # Buscamos por la raíz "Ingenier" para evitar líos con tildes (Ingeniería vs Ingenieria)
        facultad_default = Facultad.objects.filter(nombre__icontains="Ingenier").first()
        
        # Si no hay ninguna que diga "Ingenier", tomamos la primera que exista en la BD
        if not facultad_default:
            facultad_default = Facultad.objects.first()
            
        # Solo si la tabla Facultad está totalmente VACÍA, creamos una
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
            
            # Prioridad 2: Buscar por nombre exacto (por si el código cambió o es un TEMP)
            if not docente and docente_obj:
                docente = Docente.objects.filter(nombre_completo__iexact=nombre_docente_str).first()
            
            # Prioridad 3: Buscar por nombre parcial (icontains)
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

        # 2. IDENTIFICAR O BUSCAR CURSO (Sin duplicar Pensum/Carrera)
        curso_dado = None
        if nombre_curso:
            nombre_curso_limpio = str(nombre_curso).strip()
            
            # Intentamos buscar el curso en el catálogo (ya cargado por PensumParser)
            curso_obj = Curso.objects.filter(nombre_curso__icontains=nombre_curso_limpio).first()
            
            # Si el curso no existe, lo creamos pero usando estructuras EXISTENTES
            if not curso_obj:
                pensum = Pensum.objects.first() # Usamos el primer pensum que encontremos (ej: "24001")
                if not pensum:
                    # Solo si la base de datos está VACÍA creamos la estructura base
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
            
            # Buscamos o creamos el CursoDado (instancia docente-semestre-seccion)
            sec_str = str(seccion).split('.')[0].strip() if seccion and not pd.isna(seccion) else "A"
            curso_dado, created = CursoDado.objects.get_or_create(
                docente=docente,
                curso=curso_obj,
                semestre=semestre,
                seccion=sec_str
            )
            if created: print(f"  [+] Curso registrado: {nombre_curso_limpio} ({sec_str})")

        # 3. GUARDAR NOTA DIRECTA (YAGNI: Sin detalles, solo promedios)
        if nota is None or pd.isna(nota): return

        # Aseguramos que el criterio exista (Auto-creación si falta)
        criterio = CriterioEvaluacion.objects.filter(nombre__icontains=nombre_criterio).first()

        if not criterio:
            # Lógica para decidir el alcance automáticamente
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
