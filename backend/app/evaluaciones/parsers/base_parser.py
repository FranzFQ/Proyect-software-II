import pandas as pd
import re
from usuarios.models import Docente
from evaluaciones.models import (
    CursoDado, CriterioEvaluacion, 
    EvaluacionConsolidada, EvaluacionCurso
)

class BaseParser:
    @staticmethod
    def extraer_codigo_docente(texto):
        if pd.isna(texto): return None
        match = re.search(r'\((\d+)\)', str(texto))
        if match:
            return match.group(1)
        return str(texto).strip().split('.')[0]

    @staticmethod
    def buscar_docente_por_nombre(nombre_completo):
        if not nombre_completo: return None
        nombre_limpio = str(nombre_completo).strip()
        return Docente.objects.filter(nombre_completo__icontains=nombre_limpio).first()

    @staticmethod
    def guardar_nota_en_bd(codigo_docente, nombre_criterio, nota, semestre, nombre_curso=None, seccion=None, docente_obj=None):
        if nota is None or pd.isna(nota): return

        docente = docente_obj
        if not docente and codigo_docente:
            docente = Docente.objects.filter(codigo_docente=str(codigo_docente)).first()
        
        if not docente:
            print(f"  [!] ERROR: Docente no encontrado (Cod: {codigo_docente}, Nombre: {docente_obj})")
            return 

        criterio = CriterioEvaluacion.objects.filter(nombre__icontains=nombre_criterio).first()
        if not criterio:
            print(f"  [!] ERROR: Criterio '{nombre_criterio}' no existe en la BD")
            return

        # Nota: Ya no se guarda en DetalleCriterio porque la tabla fue eliminada.
        # Se mantiene la lógica de obtener/crear EvaluacionConsolidada y EvaluacionCurso por si se desea extender después.
        
        eval_consolidada, _ = EvaluacionConsolidada.objects.get_or_create(docente=docente, semestre=semestre)

        if criterio.alcance == 'CURSO':
            query_curso = CursoDado.objects.filter(docente=docente, semestre=semestre)
            if nombre_curso:
                query_curso = query_curso.filter(curso__nombre_curso__icontains=str(nombre_curso).strip())
            if seccion:
                sec_str = str(seccion).split('.')[0].strip()
                query_curso = query_curso.filter(seccion=sec_str)
            
            curso_dado = query_curso.first()
            if curso_dado:
                # Se quitó evaluacion_consolidada de EvaluacionCurso
                eval_curso, _ = EvaluacionCurso.objects.get_or_create(
                    curso_dado=curso_dado
                )
