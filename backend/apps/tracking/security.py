import hashlib
import hmac
import json

from django.core.cache import cache


def verify_device_signature(secret: str, payload: dict, signature: str) -> bool:
    if not secret or not signature:
        return not secret
    signed_payload = {key: value for key, value in payload.items() if key != "signature"}
    message = json.dumps(signed_payload, sort_keys=True, default=str, separators=(",", ":")).encode()
    digest = hmac.new(secret.encode(), message, hashlib.sha256).hexdigest()
    normalized = signature.removeprefix("hmac_sha256:").removeprefix("hmac_sha256=")
    return hmac.compare_digest(digest, normalized)


def check_and_store_nonce(device_id: str, nonce: str, ttl: int = 300) -> bool:
    """Returns True if nonce is fresh (not seen before). Stores it to prevent replay.
    Uses cache.add which is atomic — prevents TOCTOU replay under concurrent requests."""
    if not nonce:
        return False
    key = f"iot_nonce:{device_id}:{nonce}"
    return cache.add(key, 1, ttl)

