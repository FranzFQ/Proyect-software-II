from django.db.models.signals import post_save
from django.dispatch import receiver
from evaluaciones.models import ConfiguracionPonderacion
from evaluaciones.utils import consolidate_scores_for_semestre

@receiver(post_save, sender=ConfiguracionPonderacion)
def update_consolidated_scores_on_ponderacion_change(sender, instance, **kwargs):
    consolidate_scores_for_semestre(instance.semestre)
