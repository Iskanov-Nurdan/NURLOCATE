import logging
import os

logger = logging.getLogger(__name__)


def send_sms(to_phone: str, body: str) -> bool:
    account_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN", "")
    from_number = os.getenv("TWILIO_FROM_NUMBER", "")
    if not all([account_sid, auth_token, from_number, to_phone]):
        return False
    try:
        from twilio.rest import Client
        client = Client(account_sid, auth_token)
        client.messages.create(body=body, from_=from_number, to=to_phone)
        return True
    except Exception:
        logger.exception("Twilio SMS failed to %s", to_phone)
        return False
