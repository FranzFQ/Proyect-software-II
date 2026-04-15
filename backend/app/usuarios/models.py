from django.db import models
from django.contrib.auth.models import AbstractUser

class Usuario(AbstractUser):
    carrera = models.ForeignKey('academico.Carrera', on_delete=models.SET_NULL, null=True, blank=True)
    facultad = models.ForeignKey('academico.Facultad', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.username} - {self.facultad.nombre if self.facultad else 'Sin Facultad'}"

class Docente(models.Model):
    codigo_docente = models.CharField(max_length=50, unique=True)
    nombre_completo = models.CharField(max_length=255)
    facultad = models.ForeignKey('academico.Facultad', on_delete=models.SET_NULL, null=True, blank=True)
    tipo_plan = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"{self.codigo_docente} | {self.nombre_completo}"