from django.contrib.auth.models import AbstractUser
from django.db import models

# 1. Autenticación y Usuarios
class Usuario(AbstractUser): 
    facultad = models.CharField(max_length=100, null=True, blank=True)
    carrera = models.CharField(max_length=100, null=True, blank=True)

# 2. Semestres, Docentes y Carga Académica
class Semestre(models.Model):
    anio = models.CharField(max_length=5)
    ciclo = models.CharField(max_length=45) 
    visible = models.BooleanField(default=False) 
    activo_para_carga = models.BooleanField(default=False) 

class Docente(models.Model):
    codigo_docente = models.CharField(max_length=45, unique=True)
    nombre_completo = models.CharField(max_length=150)
    tipo_plan = models.CharField(max_length=45, null=True, blank=True)

class CargaAcademica(models.Model):
    docente = models.ForeignKey(Docente, on_delete=models.CASCADE)
    semestre = models.ForeignKey(Semestre, on_delete=models.CASCADE)
    total_creditos = models.IntegerField(default=0)

# 3. Transaccionales y Motor de Ponderación
class ConfiguracionPonderacion(models.Model):
    semestre = models.ForeignKey(Semestre, on_delete=models.CASCADE)
    porcentaje_ceat = models.FloatField(default=0.0)
    porcentaje_estudiantes = models.FloatField(default=0.0)
    porcentaje_observacion = models.FloatField(default=0.0)
    porcentaje_autoevaluacion = models.FloatField(default=0.0)
    porcentaje_vinculacion = models.FloatField(default=0.0)

class EvaluacionConsolidada(models.Model):
    docente = models.ForeignKey(Docente, on_delete=models.CASCADE)
    semestre = models.ForeignKey(Semestre, on_delete=models.CASCADE)
    puntaje_final = models.FloatField(default=0.0)
    resumen_ia = models.TextField(null=True, blank=True)

class DetalleCriterio(models.Model):
    evaluacion = models.ForeignKey(EvaluacionConsolidada, on_delete=models.CASCADE)
    origen = models.CharField(max_length=45)
    nota_bruta = models.FloatField(default=0.0)
    comentarios = models.TextField(null=True, blank=True)

class ChecklistObservacion(models.Model):
    evaluacion = models.ForeignKey(EvaluacionConsolidada, on_delete=models.CASCADE)
    usuario = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True)
    fecha_observacion = models.DateTimeField(auto_now_add=True)
    datos_dinamicos = models.JSONField(default=dict)