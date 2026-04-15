from django.urls import path, include
from rest_framework.routers import DefaultRouter
 

from .interface.viewsets.carrera_viewset import CarreraViewSet
from .interface.viewsets.pensum_viewset import PensumViewSet
from .interface.viewsets.semestre_viewset import SemestreViewSet
from .interface.viewsets.curso_viewset import CursoViewSet
from .interface.viewsets.facultad_viewset import FacultadViewSet
 
router = DefaultRouter()
router.register(r'carreras',  CarreraViewSet,  basename='carrera')
router.register(r'pensums',   PensumViewSet,   basename='pensum')
router.register(r'semestres', SemestreViewSet, basename='semestre')
router.register(r'cursos',    CursoViewSet,    basename='curso')
router.register(r'facultades', FacultadViewSet, basename='facultad')
 
urlpatterns = [
    path('', include(router.urls)),
]