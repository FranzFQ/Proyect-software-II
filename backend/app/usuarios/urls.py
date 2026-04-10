from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .interface.viewsets.docente_viewset import DocenteViewSet
from .interface.viewsets.usuario_viewset import UsuarioViewSet

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet, basename='usuario')
router.register(r'docentes', DocenteViewSet, basename='docente')

urlpatterns = [
    path('', include(router.urls)),
]