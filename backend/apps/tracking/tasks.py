from celery import shared_task

from .pipeline import mark_stale_devices_offline, process_location_update


@shared_task
def process_location_update_task(location_id: str) -> None:
    process_location_update(location_id)


@shared_task
def check_offline_devices_task() -> int:
    return mark_stale_devices_offline()
