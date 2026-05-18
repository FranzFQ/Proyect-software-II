from django.apps import AppConfig


class EvaluacionesConfig(AppConfig):
    name = 'evaluaciones'

    def ready(self):
        import evaluaciones.signals
