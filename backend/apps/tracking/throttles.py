from rest_framework.throttling import SimpleRateThrottle


class IoTRateThrottle(SimpleRateThrottle):
    scope = "iot"

    def get_cache_key(self, request, view):
        device_id = request.data.get("device_id") or request.query_params.get("device_id")
        if device_id:
            return self.cache_format % {"scope": self.scope, "ident": device_id}
        return None
