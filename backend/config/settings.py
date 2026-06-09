import os
from pathlib import Path

import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-only-secret")
DEBUG = os.getenv("DJANGO_DEBUG", "1") == "1"
ALLOWED_HOSTS = [host.strip() for host in os.getenv("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")]

INSTALLED_APPS = [
    "daphne",
    "jazzmin",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "channels",
    "apps.accounts",
    "apps.animals",
    "apps.devices",
    "apps.tracking",
    "apps.geofences",
    "apps.notifications",
    "apps.billing",
    "apps.audit",
    "apps.admin_panel",
    "apps.ai",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    }
]

DATABASES = {
    "default": dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
    )
}

AUTH_PASSWORD_VALIDATORS = []
LANGUAGE_CODE = "ru"
TIME_ZONE = "Asia/Bishkek"
USE_I18N = True
USE_TZ = True
STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}

CORS_ALLOWED_ORIGINS = [
    origin.strip() for origin in os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:5173").split(",")
]

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL
CELERY_TASK_ALWAYS_EAGER = os.getenv("CELERY_TASK_ALWAYS_EAGER", "1") == "1"
CELERY_BEAT_SCHEDULE = {
    "check-offline-devices": {
        "task": "apps.tracking.tasks.check_offline_devices_task",
        "schedule": 300.0,
    },
    "expire-subscriptions": {
        "task": "apps.billing.tasks.expire_subscriptions_task",
        "schedule": 3600.0,
    },
    "daily-ai-reports": {
        "task": "apps.ai.tasks.generate_daily_ai_reports",
        "schedule": 86400.0,
    },
}

DEVICE_OFFLINE_THRESHOLD_SECONDS = int(os.getenv("DEVICE_OFFLINE_THRESHOLD_SECONDS", "600"))

JAZZMIN_SETTINGS = {
    "site_title": "PetTrack OS Admin",
    "site_header": "PetTrack OS",
    "site_brand": "PetTrack OS",
    "welcome_sign": "Добро пожаловать в админку PetTrack OS",
    "copyright": "PetTrack OS",
    "show_sidebar": True,
    "navigation_expanded": True,
    "hide_apps": [],
    "hide_models": [],
    "order_with_respect_to": [
        "auth",
        "accounts",
        "animals",
        "devices",
        "tracking",
        "geofences",
        "billing",
        "notifications",
        "audit",
        "ai",
    ],
    "icons": {
        "auth": "fas fa-users-cog",
        "auth.user": "fas fa-user",
        "auth.Group": "fas fa-users",
        "animals.Animal": "fas fa-dog",
        "animals.Vaccination": "fas fa-syringe",
        "devices.Device": "fas fa-microchip",
        "devices.DeviceAssignment": "fas fa-link",
        "tracking.Location": "fas fa-map-marker-alt",
        "geofences.Geofence": "fas fa-draw-polygon",
        "geofences.GeofenceEvent": "fas fa-bell",
        "billing.SubscriptionPlan": "fas fa-tags",
        "billing.Subscription": "fas fa-credit-card",
        "billing.DeviceSubscription": "fas fa-receipt",
        "billing.Payment": "fas fa-money-bill-wave",
        "notifications.Notification": "fas fa-inbox",
        "notifications.NotificationSettings": "fas fa-sliders-h",
        "audit.AuditLog": "fas fa-clipboard-list",
        "ai.AIActivityReport": "fas fa-chart-line",
    },
}

if os.getenv("USE_REDIS", "0") == "1":
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.redis.RedisCache",
            "LOCATION": REDIS_URL,
        }
    }
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels_redis.core.RedisChannelLayer",
            "CONFIG": {"hosts": [REDIS_URL]},
        }
    }
else:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "pettrack",
        }
    }
    CHANNEL_LAYERS = {
        "default": {"BACKEND": "channels.layers.InMemoryChannelLayer"}
    }
