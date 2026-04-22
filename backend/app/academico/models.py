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
    # La FK dentro de la misma app puede ir directa o con string, usemos string por consistencia
    carrera = models.ForeignKey('academico.Carrera', on_delete=models.CASCADE, related_name='pensums')
    nombre = models.CharField(max_length=255)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.nombre} - {self.carrera.nombre}"

class Semestre(models.Model):
    anio = models.IntegerField()
    ciclo = models.IntegerField()
    disponibilidad_para_cargar = models.BooleanField(default=False)
    visibilidad = models.BooleanField(default=False)
    fecha = models.DateTimeField(null=True, blank=True)
    finalizado = models.BooleanField(default=False)

    @property
    def estado(self):
        ahora = timezone.now()

        # Si no tiene fecha o finalizado es False, podríamos definir un estado por defecto
        if not self.finalizado:
            return "Sin finalizar"

        es_fecha_pasada = self.fecha and self.fecha < ahora

        if es_fecha_pasada:
            if self.visibilidad:
                if self.disponibilidad_para_cargar:
                    return "Activo"
                else:
                    return "Finalizado"
        else:
            # Semestres Próximos (Fecha futura o actual)
            if not self.visibilidad and not self.disponibilidad_para_cargar:
                return "Próximo (Oculto)"
            if self.visibilidad and not self.disponibilidad_para_cargar:
                return "Próximo (Visible)"

        return "Indefinido"

    def save(self, *args, **kwargs):
        if self.disponibilidad_para_cargar:
            Semestre.objects.filter(disponibilidad_para_cargar=True).exclude(pk=self.pk).update(disponibilidad_para_cargar=False)

            prox_anio = self.anio
            prox_ciclo = self.ciclo + 1
            if prox_ciclo > 2:
                prox_anio += 1
                prox_ciclo = 1

            Semestre.objects.get_or_create(
                anio=prox_anio,
                ciclo=prox_ciclo,
                defaults={'disponibilidad_para_cargar': False, 'visibilidad': False}
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