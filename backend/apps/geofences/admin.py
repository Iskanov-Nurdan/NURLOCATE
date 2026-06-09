from django.contrib import admin

from .models import Geofence, GeofenceEvent

admin.site.register(Geofence)
admin.site.register(GeofenceEvent)

