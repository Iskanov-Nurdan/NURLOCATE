from celery import shared_task

from .pipeline import mark_stale_devices_offline, process_location_update, process_location_update_realtime_only


@shared_task
def process_location_update_task(location_id: str) -> None:
    process_location_update(location_id)


@shared_task(queue="low_priority")
def process_location_update_task_low_priority(location_id: str) -> None:
    """Для оффлайн-буфера: только realtime publish, без уведомлений и AI."""
    process_location_update_realtime_only(location_id)


@shared_task
def check_offline_devices_task() -> int:
    return mark_stale_devices_offline()
