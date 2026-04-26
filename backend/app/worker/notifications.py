import logging
from datetime import datetime, timedelta, timezone
from sqlalchemy import select, and_
from app.database import SyncSessionLocal
from app.models import User, Indicator
from app.config import settings

logger = logging.getLogger(__name__)

def send_email(to_email: str, subject: str, body: str):
    # Placeholder for email service (e.g. SendGrid, Mailgun)
    logger.info(f"SIMULATED EMAIL to {to_email}: {subject}")

def send_sms(to_phone: str, message: str):
    # Placeholder for SMS service (e.g. Twilio)
    logger.info(f"SIMULATED SMS to {to_phone}: {message}")

def send_push(user_id: str, title: str, body: str):
    # Placeholder for Push service (e.g. Firebase Cloud Messaging)
    logger.info(f"SIMULATED PUSH to user {user_id}: {title} - {body}")

def notify_user_of_indicator(user: User, indicator: Indicator):
    subject = f"Threat Alert: New {indicator.indicator_type} detected"
    message = f"Indicator: {indicator.value}\nSeverity: {indicator.severity}\nDescription: {indicator.description}"
    
    if user.email_notif:
        send_email(user.email, subject, message)
    
    if user.sms_notif and user.phone_number:
        send_sms(user.phone_number, f"ThreatMap Alert: {indicator.indicator_type} {indicator.value} detected. Severity: {indicator.severity}")
    
    if user.push_notif:
        send_push(str(user.id), subject, message)

def process_instant_notifications(indicator_id: str):
    with SyncSessionLocal() as db:
        indicator = db.execute(select(Indicator).where(Indicator.id == indicator_id)).scalar_one_or_none()
        if not indicator:
            return
        
        # Find users who want instant updates
        users = db.execute(select(User).where(
            and_(
                User.update_frequency == "instant",
                User.is_active == True
            )
        )).scalars().all()
        
        for user in users:
            notify_user_of_indicator(user, indicator)

def process_summary_notifications(frequency: str):
    with SyncSessionLocal() as db:
        delta = timedelta(days=1) if frequency == "daily" else timedelta(days=7)
        since = datetime.now(timezone.utc) - delta
        
        # Get new indicators in the period
        indicators = db.execute(select(Indicator).where(Indicator.created_at >= since)).scalars().all()
        if not indicators:
            return
            
        # Find users who want this frequency
        users = db.execute(select(User).where(
            and_(
                User.update_frequency == frequency,
                User.is_active == True
            )
        )).scalars().all()
        
        for user in users:
            subject = f"ThreatMap Africa {frequency.capitalize()} Summary"
            body = f"Total new indicators: {len(indicators)}\n\n"
            for ind in indicators[:10]: # Limit to top 10 in summary
                body += f"- {ind.indicator_type}: {ind.value} ({ind.severity})\n"
            
            if len(indicators) > 10:
                body += f"\n...and {len(indicators) - 10} more."
            
            if user.email_notif:
                send_email(user.email, subject, body)
            if user.push_notif:
                send_push(str(user.id), subject, body)
            # SMS usually not used for large summaries
