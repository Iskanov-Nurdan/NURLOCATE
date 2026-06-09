import hashlib
import hmac
import json


def verify_device_signature(secret: str, payload: dict, signature: str) -> bool:
    if not secret or not signature:
        return not secret
    signed_payload = {key: value for key, value in payload.items() if key != "signature"}
    message = json.dumps(signed_payload, sort_keys=True, default=str, separators=(",", ":")).encode()
    digest = hmac.new(secret.encode(), message, hashlib.sha256).hexdigest()
    normalized = signature.removeprefix("hmac_sha256:").removeprefix("hmac_sha256=")
    return hmac.compare_digest(digest, normalized)

