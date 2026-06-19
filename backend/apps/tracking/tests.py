from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from datetime import timedelta

from apps.animals.models import Animal
from apps.devices.models import Device, DeviceAssignment
from apps.billing.models import Subscription, SubscriptionPlan
from apps.billing.services import (
    device_can_sos,
    device_has_ai,
    device_history_cutoff,
    link_device_subscription,
)
from apps.tracking.models import Location

User = get_user_model()


class TrackingDeviceLevelTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpassword")
        self.animal = Animal.objects.create(owner=self.user, name="Buddy", species="dog")
        
        self.premium_plan = SubscriptionPlan.objects.create(
            code="premium",
            name="Premium Plan",
            price_cents=799,
            features={"sos": True, "ai": True, "history_days": 30}
        )
        self.free_plan = SubscriptionPlan.objects.create(
            code="free",
            name="Free Plan",
            price_cents=0,
            features={"sos": False, "ai": False, "history_hours": 24}
        )

        self.device1 = Device.objects.create(serial_number="COLLAR-111", status=Device.Status.ACTIVE)
        self.device2 = Device.objects.create(serial_number="COLLAR-222", status=Device.Status.ACTIVE)

        DeviceAssignment.objects.create(device=self.device1, animal=self.animal, is_active=True)

    def test_device_level_features(self):
        sub = Subscription.objects.create(
            user=self.user,
            plan=self.premium_plan,
            starts_at=timezone.now(),
            ends_at=timezone.now() + timedelta(days=30),
            status="active"
        )
        
        link_device_subscription(self.device1, sub)

        self.assertTrue(device_can_sos(self.device1))
        self.assertTrue(device_has_ai(self.device1))
        cutoff = device_history_cutoff(self.device1)
        self.assertAlmostEqual((timezone.now() - cutoff).days, 30, delta=1)

        self.assertFalse(device_can_sos(self.device2))
        self.assertFalse(device_has_ai(self.device2))
        cutoff2 = device_history_cutoff(self.device2)
        self.assertAlmostEqual((timezone.now() - cutoff2).total_seconds() / 3600, 24, delta=1)

    def test_iot_location_view(self):
        device = Device.objects.create(serial_number="COLLAR-XYZ", status=Device.Status.ACTIVE, mode="sos")
        
        payload = {
            "device_id": "COLLAR-XYZ",
            "timestamp": timezone.now().isoformat(),
            "lat": 42.8746,
            "lng": 74.5698,
            "battery": 80,
            "nonce": "abc123xyz"
        }
        
        response = self.client.post("/api/iot/locations/", payload, content_type="application/json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["target_mode"], "sos")
        
        device.refresh_from_db()
        self.assertEqual(device.mode, "sos")

    def test_iot_location_view_missing_device(self):
        payload = {
            "device_id": "COLLAR-NONEXISTENT",
            "timestamp": timezone.now().isoformat(),
            "lat": 42.8746,
            "lng": 74.5698,
            "battery": 80,
            "nonce": "abc123xyz"
        }
        
        response = self.client.post("/api/iot/locations/", payload, content_type="application/json")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()["detail"], "Device not found.")
