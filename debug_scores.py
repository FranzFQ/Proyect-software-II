import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')
django.setup()

from usuarios.models import Docente
from academico.models import Semestre
from evaluaciones.models import EvaluacionConsolidada, EvaluacionCurso, ChecklistObservation, CriterioEvaluacion
from django.db.models import Avg

docente_id = 149
try:
    docente = Docente.objects.get(id=docente_id)
    print(f'Docente: {docente.nombre_completo}')

    semestre = Semestre.objects.filter(activo_para_carga=True).first()
    print(f'Semestre Activo: {semestre}')

    print('\n--- ChecklistObservations ---')
    obs = ChecklistObservation.objects.filter(curso_dado__docente=docente, curso_dado__semestre=semestre)
    for o in obs:
        print(f'Curso: {o.curso_dado.curso.nombre_curso}, Punteo: {o.punteo}')
    print(f'Promedio Obs: {obs.aggregate(Avg("punteo"))["punteo__avg"]}')

    print('\n--- EvaluacionConsolidada ---')
    evs = EvaluacionConsolidada.objects.filter(docente=docente, semestre=semestre)
    for e in evs:
        crit = e.criterio.nombre if e.criterio else 'TOTAL'
        print(f'Criterio: {crit}, Punteo: {e.puntaje_final}')

    print('\n--- Global Checklist Average ---')
    global_avg = ChecklistObservation.objects.filter(curso_dado__semestre=semestre).aggregate(Avg("punteo"))["punteo__avg"]
    print(f'Global Average: {global_avg}')
except Exception as e:
    print(f'Error: {e}')
