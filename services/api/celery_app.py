import os
from celery import Celery
from config import settings

celery_app = Celery(
    "generateflow",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
    include=["jobs.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,
    worker_prefetch_multiplier=1,
    task_always_eager=os.getenv("CELERY_TASK_ALWAYS_EAGER", "false").lower() in ("1", "true", "yes"),
    task_eager_propagates=os.getenv("CELERY_TASK_EAGER_PROPAGATES", "false").lower() in ("1", "true", "yes"),
)
