from django.contrib import admin

from .models import Device, DeviceAssignment

admin.site.register(Device)
admin.site.register(DeviceAssignment)

