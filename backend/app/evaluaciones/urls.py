from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .interface.viewsets.criterio_evaluacion_viewset import CriterioEvaluacionViewSet
from .interface.viewsets.curso_dado_viewset import CursoDadoViewSet
from .interface.viewsets.configuracion_ponderacion_viewset import ConfiguracionPonderacionViewSet
from .interface.viewsets.evaluacion_consolidada_viewset import EvaluacionConsolidadaViewSet
from .interface.viewsets.evaluacion_curso_viewset import EvaluacionCursoViewSet
from .interface.viewsets.detalle_criterio_viewset import DetalleCriterioViewSet
from .interface.viewsets.checklist_observation_viewset import ChecklistObservationViewSet

router = DefaultRouter()
router.register(r'criterios',               CriterioEvaluacionViewSet,      basename='criterio')
router.register(r'cursos-dados',            CursoDadoViewSet,                basename='curso-dado')
router.register(r'ponderaciones',           ConfiguracionPonderacionViewSet, basename='ponderacion')
router.register(r'evaluaciones',            EvaluacionConsolidadaViewSet,    basename='evaluacion')
router.register(r'evaluaciones-curso',      EvaluacionCursoViewSet,          basename='evaluacion-curso')
router.register(r'detalles-criterio',       DetalleCriterioViewSet,          basename='detalle-criterio')
router.register(r'checklists',              ChecklistObservationViewSet,     basename='checklist')

urlpatterns = [
    path('', include(router.urls)),
]