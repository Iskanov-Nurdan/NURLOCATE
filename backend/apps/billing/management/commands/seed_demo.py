from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.animals.models import Animal
from apps.billing.models import Subscription, SubscriptionPlan
from apps.billing.services import link_device_subscription
from apps.devices.models import Device, DeviceAssignment
from apps.geofences.models import Geofence
from apps.notifications.models import Notification
from apps.tracking.models import Location

User = get_user_model()


class Command(BaseCommand):
    help = "Create demo data for local PetTrack OS development."

    def handle(self, *args, **options):
        user, _ = User.objects.get_or_create(
            username="demo",
            defaults={"email": "demo@pettrack.local", "first_name": "Demo"},
        )
        user.set_password("demo12345")
        user.save()

        admin, _ = User.objects.get_or_create(
            username="admin",
            defaults={"email": "admin@pettrack.local", "is_staff": True, "is_superuser": True},
        )
        admin.is_staff = True
        admin.is_superuser = True
        admin.set_password("admin")
        admin.save()

        plans = [
            ("free", "Free", 0, {"animals": 1, "history_hours": 24, "sos": False, "ai": False, "geofences": 1}),
            ("premium", "Premium", 799, {"animals": 1, "history_days": 30, "sos": True, "ai": True, "geofences": 10}),
            ("family", "Family", 1499, {"animals": 5, "history_days": 90, "sos": True, "ai": True, "geofences": 20}),
            ("business", "Business / Farm", 4900, {"devices": 100, "roles": True, "sla": True, "geofences": 100}),
        ]
        for code, name, price, features in plans:
            SubscriptionPlan.objects.update_or_create(
                code=code,
                defaults={"name": name, "price_cents": price, "features": features},
            )

        luna, _ = Animal.objects.get_or_create(
            owner=user,
            name="Luna",
            defaults={"species": "dog", "breed": "Border Collie", "weight": 18.4},
        )
        max_pet, _ = Animal.objects.get_or_create(
            owner=user,
            name="Max",
            defaults={"species": "cat", "breed": "Maine Coon", "weight": 7.8},
        )

        device1, _ = Device.objects.get_or_create(
            serial_number="COLLAR-8F2A91",
            defaults={"status": "active", "battery_level": 72, "firmware_version": "1.4.2"},
        )
        device2, _ = Device.objects.get_or_create(
            serial_number="COLLAR-7C11B0",
            defaults={"status": "active", "battery_level": 38, "firmware_version": "1.4.2"},
        )
        DeviceAssignment.objects.get_or_create(device=device1, animal=luna, is_active=True)
        DeviceAssignment.objects.get_or_create(device=device2, animal=max_pet, is_active=True)

        premium_plan = SubscriptionPlan.objects.get(code="premium")
        sub, _ = Subscription.objects.get_or_create(
            user=user,
            plan=premium_plan,
            defaults={"starts_at": timezone.now(), "status": "active", "auto_renew": True},
        )
        sub.status = "active"
        sub.save(update_fields=["status"])
        link_device_subscription(device1, sub)
        link_device_subscription(device2, sub)

        Notification.objects.get_or_create(
            user=user,
            title="Добро пожаловать в PetTrack OS",
            defaults={"body": "Ваш Premium-план активирован. SOS и AI-аналитика доступны.", "level": "info"},
        )

        Geofence.objects.get_or_create(
            owner=user,
            name="Дом",
            defaults={"center_lat": 42.874600, "center_lng": 74.569800, "radius_meters": 220},
        )
        Geofence.objects.get_or_create(
            owner=user,
            name="Опасная зона у трассы",
            defaults={"center_lat": 42.878200, "center_lng": 74.574000, "radius_meters": 120, "is_danger_zone": True},
        )

        now = timezone.now()
        route = [
            (42.874600, 74.569800, 0),
            (42.875100, 74.570700, 7),
            (42.875900, 74.571500, 14),
            (42.876800, 74.572100, 21),
            (42.877400, 74.573000, 28),
        ]
        if not Location.objects.filter(device=device1).exists():
            for lat, lng, minutes in route:
                Location.objects.create(
                    device=device1,
                    lat=lat,
                    lng=lng,
                    accuracy=7.5,
                    speed=1.8,
                    battery_level=72,
                    signal=-83,
                    mode="normal",
                    recorded_at=now - timedelta(minutes=minutes),
                )
        if not Location.objects.filter(device=device2).exists():
            Location.objects.create(
                device=device2,
                lat=42.872900,
                lng=74.566900,
                accuracy=10.2,
                speed=0.3,
                battery_level=38,
                signal=-91,
                mode="standby",
                recorded_at=now - timedelta(minutes=11),
            )

        self.stdout.write(self.style.SUCCESS("Demo data ready. Users: demo/demo12345, admin/admin"))
