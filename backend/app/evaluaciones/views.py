import pandas as pd
import re
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Avg
from .models import (
    Docente, Semestre, CursoDado, CriterioEvaluacion, 
    EvaluacionConsolidada, EvaluacionCurso, DetalleCriterio, ConfiguracionPonderacion
)

# 1. Infraestructura (parsers)

def extraer_codigo_docente(texto):
    """Extrae el número de un texto como '(27128) OROZCO PISQUIY'"""
    if pd.isna(texto): return None
    match = re.search(r'\((\d+)\)', str(texto))
    return match.group(1) if match else None

# 2. Dominio (services)

def recalcular_notas_finales(evaluacion_consolidada, semestre):
    """Calcula la nota global usando los pesos dinámicos de la base de datos"""
    
    # 1. Traer todos los pesos (porcentajes) configurados para este semestre
    ponderaciones = ConfiguracionPonderacion.objects.filter(semestre=semestre)
    pesos = {p.criterio.nombre: p.porcentaje_asignado for p in ponderaciones}
    
    nota_final = 0.0

    # 1. suma criterios globales 
    detalles_globales = DetalleCriterio.objects.filter(evaluacion_global=evaluacion_consolidada)
    for detalle in detalles_globales:
        peso_criterio = pesos.get(detalle.criterio.nombre, 0) 
        nota_final += detalle.nota_bruta * (peso_criterio / 100) # Ej: 90 * 0.20 = 18 pts


    # 2.promediar y sumar criterios de curso
    gotas_cursos = EvaluacionCurso.objects.filter(evaluacion_consolidada=evaluacion_consolidada)
    
    if gotas_cursos.exists():
        promedio_estudiantes = DetalleCriterio.objects.filter(
            evaluacion_curso__in=gotas_cursos, 
            criterio__nombre='Evaluaciones Estudiantes'
        ).aggregate(Avg('nota_bruta'))['nota_bruta__avg'] or 0.0
        
        nota_final += promedio_estudiantes * (pesos.get('Evaluaciones Estudiantes', 0) / 100)
        promedio_coordinador = DetalleCriterio.objects.filter(
            evaluacion_curso__in=gotas_cursos, 
            criterio__nombre='Criterios de Coordinador'
        ).aggregate(Avg('nota_bruta'))['nota_bruta__avg'] or 0.0
        
        nota_final += promedio_coordinador * (pesos.get('Criterios de Coordinador', 0) / 100)
        for gota in gotas_cursos:
            gota.puntaje_curso = DetalleCriterio.objects.filter(evaluacion_curso=gota).aggregate(Avg('nota_bruta'))['nota_bruta__avg'] or 0.0
            gota.save()

    # Guardar el gran total
    evaluacion_consolidada.puntaje_final = round(nota_final, 2)
    evaluacion_consolidada.save()

def guardar_nota_en_bd(codigo_docente, nombre_criterio, nota, semestre, nombre_curso_excel=None):
    """Lógica de enrutamiento: Decide si la nota va al paraguas o a la gota"""
    if not codigo_docente or pd.isna(nota): return

    # 1. Buscar Docente y Criterio
    docente = Docente.objects.filter(codigo_docente=str(codigo_docente).strip()).first()
    criterio = CriterioEvaluacion.objects.filter(nombre__icontains=nombre_criterio).first()
    
    if not docente or not criterio:
        return 

    # 2. Obtener evaluación consolidada del docente para el semestre 
    eval_consolidada, _ = EvaluacionConsolidada.objects.get_or_create(docente=docente, semestre=semestre)

    # 3. Guardar según el alcance del criterio
    if criterio.alcance == 'GLOBAL':
        DetalleCriterio.objects.create(
            criterio=criterio,
            evaluacion_global=eval_consolidada,
            nota_bruta=float(nota)
        )
    
    elif criterio.alcance == 'CURSO':
        curso_dado = CursoDado.objects.filter(docente=docente, semestre=semestre).first()
        
        if curso_dado:
            eval_curso, _ = EvaluacionCurso.objects.get_or_create(
                evaluacion_consolidada=eval_consolidada,
                curso_dado=curso_dado,
                defaults={'puntaje_curso': 0.0}
            )
            DetalleCriterio.objects.create(
                criterio=criterio,
                evaluacion_curso=eval_curso,
                nota_bruta=float(nota)
            )

    # 4. Actualizar notas
    recalcular_notas_finales(eval_consolidada, semestre)


# 3. Presentacion (views)

@csrf_exempt
def ingesta_evaluacion(request):
    if request.method == 'POST' and request.FILES.get('archivo'):
        archivo = request.FILES['archivo']
        origen = request.POST.get('origen') 
        semestre_actual = Semestre.objects.filter(activo_para_carga=True).first()
        if not semestre_actual:
            return JsonResponse({'error': 'No hay ningún semestre activo para cargar notas.'}, status=400)

        try:
            # 1. Evaluaciones estudiantes (alcance: curso)
            if origen == 'Evaluaciones Estudiantes':
                df = pd.read_csv(archivo, skiprows=11) if archivo.name.endswith('.csv') else pd.read_excel(archivo, skiprows=11)
                for _, fila in df.iterrows():
                    codigo = fila.get(' Código')
                    nota = fila.get('Resultado')
                    guardar_nota_en_bd(codigo, origen, nota, semestre_actual)

            # 2. Evaluaciones CEAT (alcance: global)
            elif origen == 'Evaluaciones CEAT':
                df = pd.read_csv(archivo, skiprows=7) if archivo.name.endswith('.csv') else pd.read_excel(archivo, skiprows=7)
                for _, fila in df.iterrows():
                    codigo = fila.get('Código Docente')
                    nota = fila.get('Nota', 0) 
                    guardar_nota_en_bd(codigo, origen, nota, semestre_actual)

            # 3. Autoevaluaciones (alcance: global)
            elif origen == 'Autoevaluaciones':
                df = pd.read_csv(archivo) if archivo.name.endswith('.csv') else pd.read_excel(archivo)
                for _, fila in df.iterrows():
                    # Suponiendo que el excel trae el código. Si trae nombre, usar la lógica de buscar por nombre.
                    codigo = fila.get('Código Docente') 
                    nota = fila.get('Nota Autoevaluación') # Esto se cambia por el nombre real de la columna en Excel
                    guardar_nota_en_bd(codigo, origen, nota, semestre_actual)

            # 4. Criterios de coordinador (alcance: curso)
            elif origen == 'Criterios de Coordinador':
                df = pd.read_csv(archivo) if archivo.name.endswith('.csv') else pd.read_excel(archivo)
                for _, fila in df.iterrows():
                    codigo = fila.get('Código Docente')
                    nota = fila.get('Nota Coordinador') # Esto se cambia por el nombre real de la columna
                    guardar_nota_en_bd(codigo, origen, nota, semestre_actual)

            # 5. Apoyo y colaboración (alcance: global)
            elif origen == 'Apoyo y colaboracion':
                df = pd.read_csv(archivo) if archivo.name.endswith('.csv') else pd.read_excel(archivo)
                for _, fila in df.iterrows():
                    codigo = fila.get('Código Docente')
                    nota = fila.get('Nota Apoyo') # Esto se cambia por el nombre real de la columna!
                    guardar_nota_en_bd(codigo, origen, nota, semestre_actual)

            else:
                return JsonResponse({'error': f'El origen "{origen}" no es válido. Usa uno de los 5 nombres oficiales.'}, status=400)

            return JsonResponse({'mensaje': f'Datos de {origen} ingresados y promediados correctamente.'})

        except Exception as e:
            return JsonResponse({'error': f"Error en el servidor procesando el archivo: {str(e)}"}, status=500)

    return JsonResponse({'error': 'Petición inválida o archivo faltante'}, status=400)