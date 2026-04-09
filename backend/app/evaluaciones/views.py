import pandas as pd
import re
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Avg
from usuarios.models import Docente
from academico.models import Semestre
from .models import (
    CursoDado, CriterioEvaluacion, 
    EvaluacionConsolidada, EvaluacionCurso, DetalleCriterio, ConfiguracionPonderacion
)
from academico.models import Curso

# --- 1. UTILIDADES ---

def extraer_codigo_docente(texto):
    if pd.isna(texto): return None
    match = re.search(r'\((\d+)\)', str(texto))
    if match:
        return match.group(1)
    return str(texto).strip().split('.')[0]

def buscar_docente_por_nombre(nombre_completo):
    if not nombre_completo: return None
    nombre_limpio = str(nombre_completo).strip()
    return Docente.objects.filter(nombre_completo__icontains=nombre_limpio).first()

# --- 2. PERSISTENCIA EN BD ---

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

    eval_consolidada, _ = EvaluacionConsolidada.objects.get_or_create(docente=docente, semestre=semestre)

    if criterio.alcance == 'GLOBAL':
        DetalleCriterio.objects.create(
            criterio=criterio,
            evaluacion_global=eval_consolidada,
            nota_bruta=float(nota)
        )
        print(f"  [OK] Guardado GLOBAL: {docente.nombre_completo} -> {criterio.nombre}: {nota}")
    
    elif criterio.alcance == 'CURSO':
        query_curso = CursoDado.objects.filter(docente=docente, semestre=semestre)
        if nombre_curso:
            query_curso = query_curso.filter(curso__nombre_curso__icontains=str(nombre_curso).strip())
        if seccion:
            sec_str = str(seccion).split('.')[0].strip()
            query_curso = query_curso.filter(seccion=sec_str)
        
        curso_dado = query_curso.first()
        
        if curso_dado:
            eval_curso, _ = EvaluacionCurso.objects.get_or_create(
                evaluacion_consolidada=eval_consolidada,
                curso_dado=curso_dado
            )
            DetalleCriterio.objects.create(
                criterio=criterio,
                evaluacion_curso=eval_curso,
                nota_bruta=float(nota)
            )
            print(f"  [OK] Guardado CURSO: {docente.nombre_completo} | {curso_dado.curso.nombre_curso} -> {nota}")
        else:
            print(f"  [!] ADVERTENCIA: No se encontró asignación para {docente.nombre_completo} en curso '{nombre_curso}' sec {seccion}")

# --- 3. LÓGICA DE PROCESAMIENTO (Compartida) ---

def procesar_ceat_logic(archivo, semestre_actual):
    df = pd.read_excel(archivo, skiprows=7)
    for _, fila in df.iterrows():
        if pd.isna(fila.get('Código Docente')) or pd.isna(fila.get('Nombre(s) y Apellidos')):
            continue
        codigo = extraer_codigo_docente(fila.get('Código Docente'))
        procesando = f"CEAT: {codigo} - {fila.get('Nombre(s) y Apellidos')}"
        print(f" PROCESANDO {procesando}")
        guardar_nota_en_bd(codigo, 'Capacitaciones CEAT', 100, semestre_actual)

def procesar_evaluacion_docente_logic(archivo, semestre_actual):
    df = pd.read_excel(archivo, skiprows=11)
    for _, fila in df.iterrows():
        col_codigo = ' Código' if ' Código' in df.columns else 'Código'
        col_resultado = 'Resultado' if 'Resultado' in df.columns else ' Resultado'
        col_seccion = ' Sección' if ' Sección' in df.columns else 'Sección'
        
        codigo = extraer_codigo_docente(fila.get(col_codigo))
        nota = fila.get(col_resultado)
        
        if codigo and not pd.isna(nota):
            curso = fila.get('Curso')
            seccion = fila.get(col_seccion)
            print(f" PROCESANDO EVAL. ESTUDIANTES: Cod {codigo} | Nota {nota} | Curso {curso}")
            guardar_nota_en_bd(codigo, 'Evaluaciones Estudiantes', nota, semestre_actual, 
                              nombre_curso=curso, seccion=seccion)

def procesar_control_docente_logic(archivo, semestre_actual):
    df = pd.read_excel(archivo)
    cols_asistencia = [
        'Asistencia reunón facultad 19 junio', 'Programa actualizado\n8 de julio',
        'Configuración de notas\n8 de julio', 'Asistencia actualizada por sesión en el portal',
        'Uso del portal académico ', 'Zonas al 20%\n23 de agosto',
        'Zonas al 30%\n17 de septiembre', 'Zonas al 40%\n27 de septiembre',
        'Zonas al 60%\n24 de octubre', 'Envío de propuestas de examen\n3 días hábiles',
        'Actas de primera y segunda convocatoria\n3 días hábiles'
    ]
    for _, fila in df.iterrows():
        nombre_docente = fila.get('Docente')
        if pd.isna(nombre_docente): continue
        docente_obj = buscar_docente_por_nombre(nombre_docente)
        valores = pd.to_numeric([fila.get(c) for c in cols_asistencia if c in fila], errors='coerce')
        valores_validos = valores[~pd.isna(valores)]
        promedio = valores_validos.mean() if len(valores_validos) > 0 else 0
        curso = fila.get('Curso')
        seccion = fila.get('Sección')
        print(f" PROCESANDO CONTROL: {nombre_docente} | Promedio {round(promedio, 2)} | Curso {curso}")
        guardar_nota_en_bd(None, 'Criterios de Coordinador', promedio, semestre_actual, 
                          nombre_curso=curso, seccion=seccion, docente_obj=docente_obj)

# --- 4. VISTA WEB (Para el Frontend) ---

@csrf_exempt
def ingesta_evaluacion(request):
    if request.method != 'POST' or not request.FILES.get('archivo'):
        return JsonResponse({'error': 'Petición inválida o archivo faltante'}, status=400)

    archivo = request.FILES['archivo']
    origen = request.POST.get('origen') 
    semestre_actual = Semestre.objects.filter(activo_para_carga=True).first()

    if not semestre_actual:
        return JsonResponse({'error': 'No hay un semestre activo para la carga.'}, status=400)

    print(f"\n>>> INGESTA WEB INICIADA: {origen} ({archivo.name})")

    try:
        if origen == 'CEAT':
            procesar_ceat_logic(archivo, semestre_actual)
        elif origen == 'Evaluación Docente':
            procesar_evaluacion_docente_logic(archivo, semestre_actual)
        elif origen == 'Control Docente':
            procesar_control_docente_logic(archivo, semestre_actual)
        else:
            return JsonResponse({'error': f'Origen "{origen}" no soportado.'}, status=400)

        return JsonResponse({'status': 'success', 'message': f'Datos de {origen} procesados correctamente.'})
    except Exception as e:
        print(f" [!] ERROR EN VISTA: {str(e)}")
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
