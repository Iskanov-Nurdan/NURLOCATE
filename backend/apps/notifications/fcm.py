import logging
import os
import threading

logger = logging.getLogger(__name__)

_firebase_initialized = False
_firebase_lock = threading.Lock()


def _init_firebase():
    global _firebase_initialized
    if _firebase_initialized:
        return
    with _firebase_lock:
        if _firebase_initialized:
            return
        try:
            import firebase_admin
            from firebase_admin import credentials
            cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "")
            if cred_path and os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)
                _firebase_initialized = True
        except Exception:
            logger.exception("Firebase init failed")


def send_push(token: str, title: str, body: str, data: dict | None = None) -> bool:
    if not token:
        return False
    try:
        _init_firebase()
        from firebase_admin import messaging
        msg = messaging.Message(
            notification=messaging.Notification(title=title, body=body),
            data={k: str(v) for k, v in (data or {}).items()},
            token=token,
        )
        messaging.send(msg)
        return True
    except Exception:
        logger.exception("FCM send failed for token=%s", token[:20])
        return False


def send_push_multicast(tokens: list[str], title: str, body: str, data: dict | None = None) -> int:
    if not tokens:
        return 0
    try:
        _init_firebase()
        from firebase_admin import messaging
        msg = messaging.MulticastMessage(
            notification=messaging.Notification(title=title, body=body),
            data={k: str(v) for k, v in (data or {}).items()},
            tokens=tokens,
        )
        result = messaging.send_each_for_multicast(msg)
        return result.success_count
    except Exception:
        logger.exception("FCM multicast failed")
        return 0
