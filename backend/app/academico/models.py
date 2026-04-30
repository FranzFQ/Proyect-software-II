from django.db import models
from django.utils import timezone

class Facultad(models.Model):
    nombre = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.nombre

class Carrera(models.Model):
    nombre = models.CharField(max_length=255)
    facultad = models.ForeignKey(Facultad, on_delete=models.CASCADE, related_name='carreras', null=True, blank=True)

    def __str__(self):
        return self.nombre

class Pensum(models.Model):
    carrera = models.ForeignKey('academico.Carrera', on_delete=models.CASCADE, related_name='pensums')
    nombre = models.CharField(max_length=255)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.nombre} - {self.carrera.nombre}"

class Semestre(models.Model):
    anio = models.IntegerField()
    ciclo = models.IntegerField()
    activo_para_carga = models.BooleanField(default=False)
    visible = models.BooleanField(default=False)
    fecha = models.DateTimeField(null=True, blank=True)
    finalizado = models.BooleanField(default=False)

    @property
    def es_visible(self):
        if self.visible:
            return True
        if self.fecha and self.fecha <= timezone.now():
            return True
        return False

    @property
    def estado(self):
        if self.finalizado:
            return "Finalizado"
        
        if self.activo_para_carga:
            return "Activo"

        if self.es_visible:
            return "Próximo (Visible)"
        
        return "Próximo (Oculto)"

    def save(self, *args, **kwargs):
        if self.activo_para_carga:
            # Desactivar otros semestres activos para carga
            Semestre.objects.filter(activo_para_carga=True).exclude(pk=self.pk).update(activo_para_carga=False)
            
            # Lógica para crear el siguiente semestre automáticamente si no existe
            prox_anio = self.anio
            prox_ciclo = self.ciclo + 1
            if prox_ciclo > 2:
                prox_anio += 1
                prox_ciclo = 1
            
            # El siguiente semestre se crea oculto por defecto
            Semestre.objects.get_or_create(
                anio=prox_anio,
                ciclo=prox_ciclo,
                defaults={
                    'activo_para_carga': False, 
                    'visible': False,
                    'finalizado': False
                }
            )
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.anio} - Ciclo {self.ciclo} ({self.estado})"

class Curso(models.Model):
    pensum = models.ForeignKey('academico.Pensum', on_delete=models.CASCADE, related_name='cursos')
    nombre_curso = models.CharField(max_length=255)
    creditos = models.IntegerField()

    def __str__(self):
        return f"{self.nombre_curso} ({self.pensum.nombre})"