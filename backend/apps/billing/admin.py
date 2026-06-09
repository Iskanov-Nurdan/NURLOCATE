from django.contrib import admin

from .models import DeviceSubscription, Payment, Subscription, SubscriptionPlan

admin.site.register(SubscriptionPlan)
admin.site.register(Subscription)
admin.site.register(DeviceSubscription)
admin.site.register(Payment)

