# evaluaciones/tasks.py
import json
import logging
from background_task import background
from evaluaciones.models import AnalisisTexto, EvaluacionConsolidada
from ai.models import SummaryState




logger = logging.getLogger(__name__)


# The `schedule` parameter means "run this X seconds from now".
# schedule=0 means "as soon as the worker picks it up" — i.e., immediately.
@background(schedule=0)
def generar_resumen(analisis_id: int):
    """
    Background task that fetches comments from a saved AnalisisTexto,
    sends them to Ollama for summarization, and stores the result.
    """
    # Importing here avoids potential circular import issues in Django
    from ai.services.summarizer import summarize_comments


    # We wrap everything in try/except so a failure updates the status
    # rather than silently disappearing into the task queue.
    try:
        analisis = AnalisisTexto.objects.get(id=analisis_id)
        status = SummaryState.objects.filter(analisis=analisis).first()
        evaluacion = EvaluacionConsolidada.objects.filter(docente=analisis.curso_dado.docente, semestre=analisis.curso_dado.semestre).first()
        print(analisis, evaluacion)


        # Immediately mark it as processing so the UI can show a spinner
        # analisis.resumen_status = AnalisisTexto.SummaryStatus.PROCESSING
        # analisis.save(update_fields=['resumen_status'])


        status.status = SummaryState.Status.PROCESSING
        status.save(update_fields=['status'])


        # This is the slow part — calling your Ollama/Mistral summarizer
        raw_response = summarize_comments(analisis.contenido)


        # Your summarizer should return JSON, but Mistral isn't always reliable,
        # so we parse safely and fall back to raw text if needed
        try:
            result = json.loads(raw_response)
            summary_text = result.get("summary", raw_response)
        except json.JSONDecodeError:
            summary_text = raw_response


        # Store the summary and mark as done
        evaluacion.resumen_ia = summary_text
        evaluacion.save(update_fields=['resumen_ia'])


        status.status = SummaryState.Status.COMPLETED
        status.save(update_fields=['status'])


        logger.info(f"Resumen generado exitosamente para AnalisisTexto {analisis_id}")


    except AnalisisTexto.DoesNotExist:
        # No point retrying if the object simply doesn't exist
        logger.error(f"AnalisisTexto {analisis_id} no encontrado, omitiendo tarea.")
    except EvaluacionConsolidada.DoesNotExist:
        logger.error(f"EvaluacionConsolidada relacionada con AnalisisTexto {analisis_id} no encontrada, omitiendo tarea.")
    except SummaryState.DoesNotExist:
        logger.error(f"SummaryState relacionada con AnalisisTexto {analisis_id} no encontrada, omitiendo tarea.")


    except Exception as exc:
        # For any other error, mark as failed — the task runner will retry
        # automatically up to BACKGROUND_TASK_MAX_ATTEMPTS times
        logger.exception(f"Error generando resumen para {analisis_id}: {exc}")
        try:
            status = SummaryState.objects.filter(analisis_id=analisis_id).first()
            if status:
                status.status = SummaryState.Status.FAILED
                status.save(update_fields=['status'])
        except Exception as e:
            print(e)  # If we can't even save the status, just let it go
        raise  # Re-raising lets django-background-tasks know it should retry

