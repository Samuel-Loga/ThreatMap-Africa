from celery import Celery
from app.config import settings

celery_app = Celery(
    "threatmap",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.worker.tasks"],
)

from celery.schedules import crontab

celery_app.conf.beat_schedule = {
    "daily-summary-task": {
        "task": "send_daily_summary",
        "schedule": crontab(hour=8, minute=0), # Daily at 8 AM UTC
    },
    "weekly-summary-task": {
        "task": "send_weekly_summary",
        "schedule": crontab(day_of_week=1, hour=9, minute=0), # Weekly on Monday at 9 AM UTC
    },
}

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_soft_time_limit=120,
    task_time_limit=180,
)
