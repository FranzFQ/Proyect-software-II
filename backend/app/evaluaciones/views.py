import pandas as pd
import re
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Docente, Semestre, EvaluacionConsolidada, DetalleCriterio, ConfiguracionPonderacion

# --- Separar Funciones principales en apps y hacerles views ---
# --- FUNCIONES AUXILIARES ---

def extraer_codigo_de_texto(texto):
    #Extrae el número de un texto como '(27128) OROZCO PISQUIY'
    if pd.isna(texto): return None
    match = re.search(r'\((\d+)\)', str(texto))
    return match.group(1) if match else None

def guardar_detalle_y_recalcular(codigo_docente, origen, nota, comentario, semestre):
    #Encapsula la lógica de la Base de Datos para mantener la vista limpia
    if not codigo_docente: return

    # 1. Buscar o Crear Docente
    docente, _ = Docente.objects.get_or_create(
        codigo_docente=str(codigo_docente).strip(),
        defaults={'nombre_completo': 'Nombre no especificado'}
    )

    # 2. Buscar o Crear la Evaluación del Semestre
    evaluacion, _ = EvaluacionConsolidada.objects.get_or_create(
        docente=docente,
        semestre=semestre
    )

    # 3. Guardar la nota/comentario específico
    DetalleCriterio.objects.create(
        evaluacion=evaluacion,
        origen=origen,
        nota_bruta=float(nota) if nota else 0.0,
        comentarios=str(comentario) if pd.notna(comentario) else None
    )

    # 4. Recalcular la Nota Final Ponderada
    recalcular_puntaje(evaluacion, semestre)

def recalcular_puntaje(evaluacion, semestre):
    ponderacion = ConfiguracionPonderacion.objects.filter(semestre=semestre).first()
    if not ponderacion: return

    pesos = {
        'CEAT': ponderacion.porcentaje_ceat,
        'ESTUDIANTIL': ponderacion.porcentaje_estudiantes,
        'OBSERVACION': ponderacion.porcentaje_observacion,
        'AUTOEVALUACION': ponderacion.porcentaje_autoevaluacion,
        'VINCULACION': ponderacion.porcentaje_vinculacion,
    }

    detalles = DetalleCriterio.objects.filter(evaluacion=evaluacion)
    # Ignoramos los comentarios (origen='COMENTARIO') para el cálculo matemático
    nota_final = sum((d.nota_bruta * (pesos.get(d.origen, 0) / 100)) for d in detalles if d.origen in pesos)
    
    evaluacion.puntaje_final = round(nota_final, 2)
    evaluacion.save()


# --- CONTROLADOR PRINCIPAL ---

@csrf_exempt
def ingesta_evaluacion(request):
    if request.method == 'POST' and request.FILES.get('archivo'):
        archivo = request.FILES['archivo']
        origen = request.POST.get('origen') # Puede ser: ESTUDIANTIL, COMENTARIOS, CEAT, CONTROL_DOCENTE

        try:
            semestre_actual = Semestre.objects.filter(activo_para_carga=True).first()
            if not semestre_actual:
                return JsonResponse({'error': 'No hay un semestre activo para asignarle los datos'}, status=400)

            # LÓGICA A LA MEDIDA POR CADA TIPO DE ARCHIVO:
            
            if origen == 'ESTUDIANTIL':
                # El archivo Ranking tiene 11 filas de encabezado antes de la tabla
                df = pd.read_csv(archivo, skiprows=11) if archivo.name.endswith('.csv') else pd.read_excel(archivo, skiprows=11)
                for _, fila in df.iterrows():
                    codigo = fila.get(' Código') # Trae un espacio en el nombre de la columna
                    nota = fila.get('Resultado')
                    if pd.notna(codigo) and pd.notna(nota):
                        guardar_detalle_y_recalcular(codigo, 'ESTUDIANTIL', nota, None, semestre_actual)

            elif origen == 'COMENTARIOS':
                # El archivo de Comentarios empieza en la fila 9 (skiprows=8)
                df = pd.read_csv(archivo, skiprows=8) if archivo.name.endswith('.csv') else pd.read_excel(archivo, skiprows=8)
                for _, fila in df.iterrows():
                    codigo = extraer_codigo_de_texto(fila.get('Catedrático')) # Saca el 27128 de "(27128) Nombre"
                    comentario = fila.get('Comentario')
                    if codigo and pd.notna(comentario):
                        guardar_detalle_y_recalcular(codigo, 'COMENTARIO', 0.0, comentario, semestre_actual)

            elif origen == 'CONTROL_DOCENTE':
                # El archivo de criterios trae múltiples notas
                df = pd.read_csv(archivo) if archivo.name.endswith('.csv') else pd.read_excel(archivo)
                for _, fila in df.iterrows():
                    # Como este archivo no trae código, buscamos al docente por nombre
                    nombre_excel = str(fila.get('Docente', '')).split(',')[0].strip() # Ej: Saca "Méndez Pú"
                    docente = Docente.objects.filter(nombre_completo__icontains=nombre_excel).first()
                    if not docente: continue

                    nota_autoeval = fila.get('Autoevaluación')
                    nota_observacion = fila.get('Evaluación desde la coordinación')

                    if pd.notna(nota_autoeval):
                        guardar_detalle_y_recalcular(docente.codigo_docente, 'AUTOEVALUACION', nota_autoeval, None, semestre_actual)
                    if pd.notna(nota_observacion):
                        guardar_detalle_y_recalcular(docente.codigo_docente, 'OBSERVACION', nota_observacion, None, semestre_actual)

            elif origen == 'CEAT':
                # El archivo CEAT tiene los encabezados en la fila 8
                df = pd.read_csv(archivo, skiprows=7) if archivo.name.endswith('.csv') else pd.read_excel(archivo, skiprows=7)
                for _, fila in df.iterrows():
                    codigo = fila.get('Código Docente')
                    # Buscamos la columna de nota, ver de que exista en el Excel
                    nota = fila.get('Nota', 0) # Ajustar el nombre 'Nota' si la columna se llama diferente
                    if pd.notna(codigo):
                        guardar_detalle_y_recalcular(codigo, 'CEAT', nota, None, semestre_actual)

            else:
                return JsonResponse({'error': 'Tipo de origen no soportado'}, status=400)

            return JsonResponse({'mensaje': f'Datos de {origen} ingresados correctamente.'})

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Petición inválida'}, status=400)