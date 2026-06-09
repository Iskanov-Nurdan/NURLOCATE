from celery import shared_task

from apps.animals.models import Animal

from .services import analyze_animal_activity


@shared_task
def generate_daily_ai_reports():
    for animal in Animal.objects.all().iterator():
        analyze_animal_activity(animal)
