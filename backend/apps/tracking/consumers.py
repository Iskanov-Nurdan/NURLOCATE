from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth.models import AnonymousUser


class TrackingConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get("user")
        if not self.user or isinstance(self.user, AnonymousUser) or not self.user.is_authenticated:
            await self.close()
            return

        self.groups_joined = []
        await self.join_group(f"user_{self.user.id}_locations")
        await self.join_group(f"user_{self.user.id}_alerts")

        if self.user.is_staff:
            await self.join_group("admin_devices")
        if self.user.is_superuser:
            await self.join_group("super_admin_system")

        await self.accept()
        await self.send_json({"type": "connection.ready", "user_id": self.user.id})

    async def join_group(self, name: str):
        await self.channel_layer.group_add(name, self.channel_name)
        self.groups_joined.append(name)

    async def disconnect(self, code):
        for group in getattr(self, "groups_joined", []):
            await self.channel_layer.group_discard(group, self.channel_name)

    async def tracking_event(self, event):
        await self.send_json(event["payload"])
