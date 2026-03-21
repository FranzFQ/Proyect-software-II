from django.db import models
from django.contrib.auth.models import AbstractUser

class Carrera(models.Model):
    nombre = models.CharField(max_length=255)

    def __str__(self):
        return self.nombre

class Pensum(models.Model):
    carrera = models.ForeignKey(Carrera, on_delete=models.CASCADE, related_name='pensums')
    nombre = models.CharField(max_length=255)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.nombre} - {self.carrera.nombre}"

class Curso(models.Model):
    pensum = models.ForeignKey(Pensum, on_delete=models.CASCADE, related_name='cursos')
    nombre_curso = models.CharField(max_length=255)
    creditos = models.IntegerField()

    def __str__(self):
        return f"{self.nombre_curso} ({self.pensum.nombre})"

class CriterioEvaluacion(models.Model):
    ALCANCE_CHOICES = [
        ('GLOBAL', 'Evaluación Global'),
        ('CURSO', 'Evaluación por Curso'),
    ]
    nombre = models.CharField(max_length=255)
    alcance = models.CharField(max_length=10, choices=ALCANCE_CHOICES)

    def __str__(self):
        return f"{self.nombre} [{self.alcance}]"

class Usuario(AbstractUser):
    carrera = models.ForeignKey(Carrera, on_delete=models.SET_NULL, null=True, blank=True)
    facultad = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"{self.username} - {self.facultad or 'Sin Facultad'}"

class Semestre(models.Model):
    anio = models.IntegerField()
    ciclo = models.IntegerField()
    activo_para_carga = models.BooleanField(default=False)
    visible = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        # Si se activa para carga, desactivar todos los demás
        if self.activo_para_carga:
            Semestre.objects.filter(activo_para_carga=True).exclude(pk=self.pk).update(activo_para_carga=False)
            
            # Lógica para crear automáticamente el siguiente semestre
            prox_anio = self.anio
            prox_ciclo = self.ciclo + 1
            if prox_ciclo > 2: # Asumiendo un sistema de 2 ciclos anuales
                prox_anio += 1
                prox_ciclo = 1
            
            Semestre.objects.get_or_create(
                anio=prox_anio,
                ciclo=prox_ciclo,
                defaults={'activo_para_carga': False, 'visible': False}
            )
            
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.anio} - Ciclo {self.ciclo}"


class Docente(models.Model):
    codigo_docente = models.CharField(max_length=50, unique=True)
    nombre_completo = models.CharField(max_length=255)
    tipo_plan = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"{self.codigo_docente} | {self.nombre_completo}"

class CursoDado(models.Model):
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE)
    docente = models.ForeignKey(Docente, on_delete=models.CASCADE, related_name='asignaciones')
    semestre = models.ForeignKey(Semestre, on_delete=models.CASCADE)
    seccion = models.CharField(max_length=10)

    class Meta:
        verbose_name_plural = "Cursos Dados"

    def __str__(self):
        return f"{self.curso.nombre_curso} - Sec: {self.seccion} ({self.semestre})"

class ConfiguracionPonderacion(models.Model):
    semestre = models.ForeignKey(Semestre, on_delete=models.CASCADE)
    criterio = models.ForeignKey(CriterioEvaluacion, on_delete=models.CASCADE)
    porcentaje_asignado = models.FloatField()

    class Meta:
        verbose_name_plural = "Configuraciones de Ponderación"

    def __str__(self):
        return f"{self.criterio.nombre}: {self.porcentaje_asignado}% ({self.semestre})"

class EvaluacionConsolidada(models.Model):
    docente = models.ForeignKey(Docente, on_delete=models.CASCADE)
    semestre = models.ForeignKey(Semestre, on_delete=models.CASCADE)
    puntaje_final = models.FloatField()
    resumen_ia = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Consolidado: {self.docente.nombre_completo} - {self.semestre}"

class EvaluacionCurso(models.Model):
    evaluacion_consolidada = models.ForeignKey(EvaluacionConsolidada, on_delete=models.CASCADE, related_name='gotas_curso')
    curso_dado = models.ForeignKey(CursoDado, on_delete=models.CASCADE)
    puntaje_curso = models.FloatField()

    def __str__(self):
        return f"Nota Curso: {self.curso_dado.curso.nombre_curso} - {self.puntaje_curso}"

class DetalleCriterio(models.Model):
    criterio = models.ForeignKey(CriterioEvaluacion, on_delete=models.CASCADE)
    evaluacion_global = models.ForeignKey(EvaluacionConsolidada, on_delete=models.CASCADE, null=True, blank=True, related_name='detalles_globales')
    evaluacion_curso = models.ForeignKey(EvaluacionCurso, on_delete=models.CASCADE, null=True, blank=True, related_name='detalles_curso')
    nota_bruta = models.FloatField()
    comentarios = models.TextField(null=True, blank=True)

    def __str__(self):
        alcance = "Global" if self.evaluacion_global else "Curso"
        return f"{self.criterio.nombre} ({alcance}): {self.nota_bruta}"

class ChecklistObservation(models.Model):
    curso_dado = models.ForeignKey(CursoDado, on_delete=models.CASCADE, related_name='checklists_realizadas')
    titulo = models.CharField(max_length=255)
    usuario = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True)
    fecha_observacion = models.DateTimeField(auto_now_add=True)
    datos = models.JSONField(default=dict) 
    def __str__(self):
        return f"{self.titulo} - {self.curso_dado.docente.nombre_completo}"
