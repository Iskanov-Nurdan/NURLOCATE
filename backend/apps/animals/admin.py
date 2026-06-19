from django.contrib import admin

from .models import Animal, MedicalRecord, Vaccination

admin.site.register(Animal)
admin.site.register(Vaccination)
admin.site.register(MedicalRecord)

