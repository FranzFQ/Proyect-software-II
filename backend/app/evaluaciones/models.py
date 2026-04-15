from django.db import models

class CriterioEvaluacion(models.Model):
    ALCANCE_CHOICES = [
        ('GLOBAL', 'Evaluación Global'),
        ('CURSO', 'Evaluación por Curso'),
    ]
    nombre = models.CharField(max_length=255)
    alcance = models.CharField(max_length=10, choices=ALCANCE_CHOICES)

    def __str__(self):
        return f"{self.nombre} [{self.alcance}]"

class CursoDado(models.Model):
    curso = models.ForeignKey('academico.Curso', on_delete=models.CASCADE)
    docente = models.ForeignKey('usuarios.Docente', on_delete=models.CASCADE, related_name='asignaciones')
    semestre = models.ForeignKey('academico.Semestre', on_delete=models.CASCADE)
    seccion = models.CharField(max_length=10)
    jornada = models.CharField(max_length=50, null=True, blank=True) 
    
    class Meta:
        verbose_name_plural = "Cursos Dados"

    def __str__(self):
        return f"{self.curso.nombre_curso} - Sec: {self.seccion} ({self.semestre})"

class ConfiguracionPonderacion(models.Model):
    semestre = models.ForeignKey('academico.Semestre', on_delete=models.CASCADE)
    criterio = models.ForeignKey('evaluaciones.CriterioEvaluacion', on_delete=models.CASCADE)
    porcentaje_asignado = models.FloatField()

    class Meta:
        verbose_name_plural = "Configuraciones de Ponderación"

    def __str__(self):
        return f"{self.criterio.nombre}: {self.porcentaje_asignado}% ({self.semestre})"

class EvaluacionConsolidada(models.Model):
    docente = models.ForeignKey('usuarios.Docente', on_delete=models.CASCADE)
    semestre = models.ForeignKey('academico.Semestre', on_delete=models.CASCADE)
    criterio = models.ForeignKey('evaluaciones.CriterioEvaluacion', on_delete=models.CASCADE, null=True, blank=True)
    puntaje_final = models.FloatField(default=0.0)
    resumen_ia = models.TextField(null=True, blank=True)

    def __str__(self):
        criterio_nombre = self.criterio.nombre if self.criterio else "Total"
        return f"Consolidado: {self.docente.nombre_completo} - {criterio_nombre} ({self.semestre})"

class EvaluacionCurso(models.Model):
    curso_dado = models.ForeignKey('evaluaciones.CursoDado', on_delete=models.CASCADE)
    criterio = models.ForeignKey('evaluaciones.CriterioEvaluacion', on_delete=models.CASCADE, null=True, blank=True)
    puntaje_curso = models.FloatField(default=0.0)

    def __str__(self):
        criterio_nombre = self.criterio.nombre if self.criterio else "Total"
        return f"Nota {criterio_nombre}: {self.curso_dado.curso.nombre_curso} - {self.puntaje_curso}"

class Tipo(models.Model):
    nombre = models.CharField(max_length=255)

    def __str__(self):
        return self.nombre

class AnalisisTexto(models.Model):
    contenido = models.JSONField()
    curso_dado = models.ForeignKey('evaluaciones.CursoDado', on_delete=models.CASCADE)
    tipo = models.ForeignKey('evaluaciones.Tipo', on_delete=models.CASCADE)

    def __str__(self):
        return f"Análisis {self.tipo.nombre} - {self.curso_dado}"

class ChecklistObservation(models.Model):
    curso_dado = models.ForeignKey('evaluaciones.CursoDado', on_delete=models.CASCADE, related_name='checklists_realizadas')
    titulo = models.CharField(max_length=255)
    usuario = models.ForeignKey('usuarios.Usuario', on_delete=models.SET_NULL, null=True)
    fecha_observacion = models.DateTimeField(auto_now_add=True)
    datos = models.JSONField(default=dict) 

    def __str__(self):
        return f"{self.titulo} - {self.curso_dado.docente.nombre_completo}"