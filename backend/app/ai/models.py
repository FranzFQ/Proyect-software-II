from django.db import models
from evaluaciones.models import EvaluacionConsolidada, AnalisisTexto


class SummaryState(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'pendiente'
        PROCESSING = 'processing', 'Procesando'
        COMPLETED = 'completed', 'Listo'
        FAILED = 'failed', 'Fallido'
   
    evaluacion = models.ForeignKey(EvaluacionConsolidada, on_delete=models.DO_NOTHING, related_name='summary_states', null=True)
    analisis = models.ForeignKey(AnalisisTexto, on_delete=models.DO_NOTHING, related_name='summary_states')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f"SummaryState {self.id} for {self.evaluacion} created at {self.created_at}"

