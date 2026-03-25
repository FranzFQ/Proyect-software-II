from django.db import models

class Carrera(models.Model):
    nombre = models.CharField(max_length=255)

    def __str__(self):
        return self.nombre

class Pensum(models.Model):
    # La FK dentro de la misma app puede ir directa o con string, usemos string por consistencia
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

    def save(self, *args, **kwargs):
        if self.activo_para_carga:
            Semestre.objects.filter(activo_para_carga=True).exclude(pk=self.pk).update(activo_para_carga=False)
            
            prox_anio = self.anio
            prox_ciclo = self.ciclo + 1
            if prox_ciclo > 2:
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

class Curso(models.Model):
    pensum = models.ForeignKey('academico.Pensum', on_delete=models.CASCADE, related_name='cursos')
    nombre_curso = models.CharField(max_length=255)
    creditos = models.IntegerField()

    def __str__(self):
        return f"{self.nombre_curso} ({self.pensum.nombre})"