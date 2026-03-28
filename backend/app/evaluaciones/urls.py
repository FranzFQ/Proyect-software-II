from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    CriterioEvaluacionViewSet,
    CursoDadoViewSet,
    ConfiguracionPonderacionViewSet,
    EvaluacionConsolidadaViewSet,
    EvaluacionCursoViewSet,
    DetalleCriterioViewSet,
    ChecklistObservationViewSet,
)

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