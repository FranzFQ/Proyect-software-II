from django.db.models import Avg

def consolidate_scores_for_semestre(semestre):
    if not semestre:
        return

    from usuarios.models import Docente
    from evaluaciones.models import (
        EvaluacionConsolidada, 
        EvaluacionCurso, 
        ConfiguracionPonderacion,
        ChecklistObservation
    )

    ponderaciones = ConfiguracionPonderacion.objects.filter(semestre=semestre).select_related('criterio')
    pond_dict = {p.criterio.nombre: p.porcentaje_asignado for p in ponderaciones}
    
    mapping = {
        'Evaluaciones Estudiantes': 'estudiantil',
        'Capacitaciones CEAT':       'ceat',
        'Autoevaluaciones':          'autoevaluacion',
        'Control Docente':           'coordinador',
        'Criterios de Coordinador':  'coordinador',
        'Checklist':                 'visitas',
        'Apoyo y Colaboración':      'apoyo'
    }

    docentes = Docente.objects.all()

    for docente in docentes:
        scores = {}
        
        # CEAT
        ceat = EvaluacionConsolidada.objects.filter(
            docente=docente, semestre=semestre, criterio__nombre='Capacitaciones CEAT'
        ).first()
        if ceat: scores['ceat'] = ceat.puntaje_final
        
        # Estudiantil y Coordinador
        curs_evals = EvaluacionCurso.objects.filter(
            curso_dado__docente=docente,
            curso_dado__semestre=semestre
        ).values('criterio__nombre').annotate(v=Avg('puntaje_curso'))
        
        for e in curs_evals:
            name = e['criterio__nombre']
            key = mapping.get(name)
            if key: scores[key] = e['v']
            
        # Checklist
        avg_ch = ChecklistObservation.objects.filter(
            curso_dado__docente=docente,
            curso_dado__semestre=semestre
        ).aggregate(v=Avg('punteo'))['v']
        if avg_ch: scores['visitas'] = avg_ch

        weighted_score = 0
        total_weight_found = 0
        
        for crit_name, percent in pond_dict.items():
            key = mapping.get(crit_name)
            if key in scores and percent > 0:
                val = scores[key]
                if val > 10.1: val /= 10
                weighted_score += (val * (percent / 100))
                total_weight_found += percent
        
        final_score = round(weighted_score, 1)

        consolidado_total, _ = EvaluacionConsolidada.objects.get_or_create(
            docente=docente,
            semestre=semestre,
            criterio=None
        )
        consolidado_total.puntaje_final = final_score
        consolidado_total.save()
