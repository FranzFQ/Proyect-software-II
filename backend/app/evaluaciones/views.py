from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    CriterioEvaluacion,
    CursoDado,
    ConfiguracionPonderacion,
    EvaluacionConsolidada,
    EvaluacionCurso,
    DetalleCriterio,
    ChecklistObservation,
)
from .serializers import (
    CriterioEvaluacionSerializer,
    CursoDadoSerializer,
    ConfiguracionPonderacionSerializer,
    EvaluacionConsolidadaSerializer,
    EvaluacionCursoSerializer,
    DetalleCriterioSerializer,
    ChecklistObservationSerializer,
)


class CriterioEvaluacionViewSet(viewsets.ModelViewSet):
    queryset = CriterioEvaluacion.objects.all().order_by('nombre')
    serializer_class = CriterioEvaluacionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]

    # Opciones de filtrado y de busqueda para los criterios de evaluacion
    filterset_fields = ['alcance']
    search_fields = ['nombre']


class CursoDadoViewSet(viewsets.ModelViewSet):
    queryset = (
        CursoDado.objects
        .select_related('curso', 'docente', 'semestre')
        .all()
        .order_by('semestre', 'curso__nombre_curso')
    )
    serializer_class = CursoDadoSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]

    # Opciones de filtrado y de busqueda para los cursos dados
    filterset_fields = ['docente', 'semestre', 'curso']
    search_fields = ['seccion', 'curso__nombre_curso', 'docente__nombre_completo']

    # Accion adicional para obtener checklists de un curso dado específico
    @action(detail=True, methods=['get'], url_path='checklists')
    def checklists(self, request, pk=None):
        curso_dado = self.get_object()
        checklists = curso_dado.checklists_realizadas.all()
        serializer = ChecklistObservationSerializer(checklists, many=True)
        return Response(serializer.data)


class ConfiguracionPonderacionViewSet(viewsets.ModelViewSet):
    queryset = (
        ConfiguracionPonderacion.objects
        .select_related('semestre', 'criterio')
        .all()
        .order_by('semestre', 'criterio__nombre')
    )
    serializer_class = ConfiguracionPonderacionSerializer
    filter_backends = [DjangoFilterBackend]

    # Opcion de filtrado para la conficuracion de pondaraciones
    filterset_fields = ['semestre', 'criterio',]


class EvaluacionConsolidadaViewSet(viewsets.ModelViewSet):
    queryset = (
        EvaluacionConsolidada.objects
        .select_related('docente', 'semestre')
        .prefetch_related('gotas_curso', 'detalles_globales')
        .all()
        .order_by('semestre', 'docente__nombre_completo')
    )
    serializer_class = EvaluacionConsolidadaSerializer
    filter_backends = [DjangoFilterBackend]

    # Opcion de filtrado para los docentes y los semestres
    filterset_fields = ['docente', 'semestre']


class EvaluacionCursoViewSet(viewsets.ModelViewSet):
    queryset = (
        EvaluacionCurso.objects
        .select_related('evaluacion_consolidada', 'curso_dado__curso')
        .prefetch_related('detalles_curso')
        .all()
    )
    serializer_class = EvaluacionCursoSerializer
    filter_backends = [DjangoFilterBackend]

    # Opcion de filtrado para las evaluaciones cd curso
    filterset_fields = ['evaluacion_consolidada', 'curso_dado']


class DetalleCriterioViewSet(viewsets.ModelViewSet):
    queryset = (
        DetalleCriterio.objects
        .select_related('criterio', 'evaluacion_global', 'evaluacion_curso')
        .all()
    )
    serializer_class = DetalleCriterioSerializer
    filter_backends = [DjangoFilterBackend]

    # Opciones de filtrado para los detalles de criterios
    filterset_fields = ['criterio', 'evaluacion_global', 'evaluacion_curso']


class ChecklistObservationViewSet(viewsets.ModelViewSet):
    queryset = (
        ChecklistObservation.objects
        .select_related('curso_dado__curso', 'usuario')
        .all()
        .order_by('-fecha_observacion')
    )
    serializer_class = ChecklistObservationSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]

    # Busqueda y filatrado para los checklists de observaciones
    filterset_fields = ['curso_dado', 'usuario']
    search_fields = ['titulo']

# import pandas as pd
# import re
# from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt
# from django.db.models import Avg
# from .models import (
#     Docente, Semestre, CursoDado, CriterioEvaluacion, 
#     EvaluacionConsolidada, EvaluacionCurso, DetalleCriterio, ConfiguracionPonderacion
# )

# # 1. Infraestructura (parsers)

# def extraer_codigo_docente(texto):
#     """Extrae el número de un texto como '(27128) OROZCO PISQUIY'"""
#     if pd.isna(texto): return None
#     match = re.search(r'\((\d+)\)', str(texto))
#     return match.group(1) if match else None

# # 2. Dominio (services)

# def recalcular_notas_finales(evaluacion_consolidada, semestre):
#     """Calcula la nota global usando los pesos dinámicos de la base de datos"""
    
#     # 1. Traer todos los pesos (porcentajes) configurados para este semestre
#     ponderaciones = ConfiguracionPonderacion.objects.filter(semestre=semestre)
#     pesos = {p.criterio.nombre: p.porcentaje_asignado for p in ponderaciones}
    
#     nota_final = 0.0

#     # 1. suma criterios globales 
#     detalles_globales = DetalleCriterio.objects.filter(evaluacion_global=evaluacion_consolidada)
#     for detalle in detalles_globales:
#         peso_criterio = pesos.get(detalle.criterio.nombre, 0) 
#         nota_final += detalle.nota_bruta * (peso_criterio / 100) # Ej: 90 * 0.20 = 18 pts


#     # 2.promediar y sumar criterios de curso
#     gotas_cursos = EvaluacionCurso.objects.filter(evaluacion_consolidada=evaluacion_consolidada)
    
#     if gotas_cursos.exists():
#         promedio_estudiantes = DetalleCriterio.objects.filter(
#             evaluacion_curso__in=gotas_cursos, 
#             criterio__nombre='Evaluaciones Estudiantes'
#         ).aggregate(Avg('nota_bruta'))['nota_bruta__avg'] or 0.0
        
#         nota_final += promedio_estudiantes * (pesos.get('Evaluaciones Estudiantes', 0) / 100)
#         promedio_coordinador = DetalleCriterio.objects.filter(
#             evaluacion_curso__in=gotas_cursos, 
#             criterio__nombre='Criterios de Coordinador'
#         ).aggregate(Avg('nota_bruta'))['nota_bruta__avg'] or 0.0
        
#         nota_final += promedio_coordinador * (pesos.get('Criterios de Coordinador', 0) / 100)
#         for gota in gotas_cursos:
#             gota.puntaje_curso = DetalleCriterio.objects.filter(evaluacion_curso=gota).aggregate(Avg('nota_bruta'))['nota_bruta__avg'] or 0.0
#             gota.save()

#     # Guardar el gran total
#     evaluacion_consolidada.puntaje_final = round(nota_final, 2)
#     evaluacion_consolidada.save()

# def guardar_nota_en_bd(codigo_docente, nombre_criterio, nota, semestre, nombre_curso_excel=None):
#     """Lógica de enrutamiento: Decide si la nota va al paraguas o a la gota"""
#     if not codigo_docente or pd.isna(nota): return

#     # 1. Buscar Docente y Criterio
#     docente = Docente.objects.filter(codigo_docente=str(codigo_docente).strip()).first()
#     criterio = CriterioEvaluacion.objects.filter(nombre__icontains=nombre_criterio).first()
    
#     if not docente or not criterio:
#         return 

#     # 2. Obtener evaluación consolidada del docente para el semestre 
#     eval_consolidada, _ = EvaluacionConsolidada.objects.get_or_create(docente=docente, semestre=semestre)

#     # 3. Guardar según el alcance del criterio
#     if criterio.alcance == 'GLOBAL':
#         DetalleCriterio.objects.create(
#             criterio=criterio,
#             evaluacion_global=eval_consolidada,
#             nota_bruta=float(nota)
#         )
    
#     elif criterio.alcance == 'CURSO':
#         curso_dado = CursoDado.objects.filter(docente=docente, semestre=semestre).first()
        
#         if curso_dado:
#             eval_curso, _ = EvaluacionCurso.objects.get_or_create(
#                 evaluacion_consolidada=eval_consolidada,
#                 curso_dado=curso_dado,
#                 defaults={'puntaje_curso': 0.0}
#             )
#             DetalleCriterio.objects.create(
#                 criterio=criterio,
#                 evaluacion_curso=eval_curso,
#                 nota_bruta=float(nota)
#             )

#     # 4. Actualizar notas
#     recalcular_notas_finales(eval_consolidada, semestre)


# # 3. Presentacion (views)

# @csrf_exempt
# def ingesta_evaluacion(request):
#     if request.method == 'POST' and request.FILES.get('archivo'):
#         archivo = request.FILES['archivo']
#         origen = request.POST.get('origen') 
#         semestre_actual = Semestre.objects.filter(activo_para_carga=True).first()
#         if not semestre_actual:
#             return JsonResponse({'error': 'No hay ningún semestre activo para cargar notas.'}, status=400)

#         try:
#             # 1. Evaluaciones estudiantes (alcance: curso)
#             if origen == 'Evaluaciones Estudiantes':
#                 df = pd.read_csv(archivo, skiprows=11) if archivo.name.endswith('.csv') else pd.read_excel(archivo, skiprows=11)
#                 for _, fila in df.iterrows():
#                     codigo = fila.get(' Código')
#                     nota = fila.get('Resultado')
#                     guardar_nota_en_bd(codigo, origen, nota, semestre_actual)

#             # 2. Evaluaciones CEAT (alcance: global)
#             elif origen == 'Evaluaciones CEAT':
#                 df = pd.read_csv(archivo, skiprows=7) if archivo.name.endswith('.csv') else pd.read_excel(archivo, skiprows=7)
#                 for _, fila in df.iterrows():
#                     codigo = fila.get('Código Docente')
#                     nota = fila.get('Nota', 0) 
#                     guardar_nota_en_bd(codigo, origen, nota, semestre_actual)

#             # 3. Autoevaluaciones (alcance: global)
#             elif origen == 'Autoevaluaciones':
#                 df = pd.read_csv(archivo) if archivo.name.endswith('.csv') else pd.read_excel(archivo)
#                 for _, fila in df.iterrows():
#                     # Suponiendo que el excel trae el código. Si trae nombre, usar la lógica de buscar por nombre.
#                     codigo = fila.get('Código Docente') 
#                     nota = fila.get('Nota Autoevaluación') # Esto se cambia por el nombre real de la columna en Excel
#                     guardar_nota_en_bd(codigo, origen, nota, semestre_actual)

#             # 4. Criterios de coordinador (alcance: curso)
#             elif origen == 'Criterios de Coordinador':
#                 df = pd.read_csv(archivo) if archivo.name.endswith('.csv') else pd.read_excel(archivo)
#                 for _, fila in df.iterrows():
#                     codigo = fila.get('Código Docente')
#                     nota = fila.get('Nota Coordinador') # Esto se cambia por el nombre real de la columna
#                     guardar_nota_en_bd(codigo, origen, nota, semestre_actual)

#             # 5. Apoyo y colaboración (alcance: global)
#             elif origen == 'Apoyo y colaboracion':
#                 df = pd.read_csv(archivo) if archivo.name.endswith('.csv') else pd.read_excel(archivo)
#                 for _, fila in df.iterrows():
#                     codigo = fila.get('Código Docente')
#                     nota = fila.get('Nota Apoyo') # Esto se cambia por el nombre real de la columna!
#                     guardar_nota_en_bd(codigo, origen, nota, semestre_actual)

#             else:
#                 return JsonResponse({'error': f'El origen "{origen}" no es válido. Usa uno de los 5 nombres oficiales.'}, status=400)

#             return JsonResponse({'mensaje': f'Datos de {origen} ingresados y promediados correctamente.'})

#         except Exception as e:
#             return JsonResponse({'error': f"Error en el servidor procesando el archivo: {str(e)}"}, status=500)

#     return JsonResponse({'error': 'Petición inválida o archivo faltante'}, status=400)