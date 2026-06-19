import uuid

from django.conf import settings
from django.db import models


class Animal(models.Model):
    class Species(models.TextChoices):
        DOG = "dog", "Dog"
        CAT = "cat", "Cat"
        HORSE = "horse", "Horse"
        LIVESTOCK = "livestock", "Livestock"
        OTHER = "other", "Other"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="animals")
    name = models.CharField(max_length=120)
    photo_url = models.URLField(blank=True)
    species = models.CharField(max_length=32, choices=Species.choices, default=Species.DOG)
    breed = models.CharField(max_length=120, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    sex = models.CharField(max_length=24, blank=True)
    weight = models.FloatField(null=True, blank=True)
    medical_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Vaccination(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    animal = models.ForeignKey(Animal, on_delete=models.CASCADE, related_name="vaccinations")
    name = models.CharField(max_length=160)
    vaccinated_at = models.DateField()
    expires_at = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.animal} - {self.name}"


class MedicalRecord(models.Model):
    class RecordType(models.TextChoices):
        CHECKUP = "checkup", "Осмотр"
        TREATMENT = "treatment", "Лечение"
        SURGERY = "surgery", "Операция"
        LAB = "lab", "Анализы"
        OTHER = "other", "Прочее"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    animal = models.ForeignKey(Animal, on_delete=models.CASCADE, related_name="medical_records")
    record_type = models.CharField(max_length=32, choices=RecordType.choices, default=RecordType.CHECKUP)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    vet_name = models.CharField(max_length=120, blank=True)
    clinic = models.CharField(max_length=200, blank=True)
    date = models.DateField()
    next_visit = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.animal} - {self.title}"

