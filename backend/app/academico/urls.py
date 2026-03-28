from django.urls import path, include
from rest_framework.routers import DefaultRouter
 
from .views import CarreraViewSet, PensumViewSet, SemestreViewSet, CursoViewSet
 
router = DefaultRouter()
router.register(r'carreras',  CarreraViewSet,  basename='carrera')
router.register(r'pensums',   PensumViewSet,   basename='pensum')
router.register(r'semestres', SemestreViewSet, basename='semestre')
router.register(r'cursos',    CursoViewSet,    basename='curso')
 
urlpatterns = [
    path('', include(router.urls)),
]