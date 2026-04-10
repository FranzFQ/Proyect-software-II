from django.urls import path, include
from rest_framework.routers import DefaultRouter
 

from .interface.viewsets.carrera_viewset import CarreraViewSet
from .interface.viewsets.pensum_viewset import PensumViewSet
from .interface.viewsets.semestre_viewset import SemestreViewSet
from .interface.viewsets.curso_viewset import CursoViewSet
 
router = DefaultRouter()
router.register(r'carreras',  CarreraViewSet,  basename='carrera')
router.register(r'pensums',   PensumViewSet,   basename='pensum')
router.register(r'semestres', SemestreViewSet, basename='semestre')
router.register(r'cursos',    CursoViewSet,    basename='curso')
 
urlpatterns = [
    path('', include(router.urls)),
]