from django.urls import path

from .totp_views import TOTPDisableView, TOTPSetupView, TOTPStatusView, TOTPVerifyView
from .views import FCMTokenView, LoginView, LogoutView, MeView, ProfileView, RefreshView, RegisterView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("refresh/", RefreshView.as_view(), name="refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("me/", MeView.as_view(), name="me"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("fcm-token/", FCMTokenView.as_view(), name="fcm-token"),
    path("2fa/setup/", TOTPSetupView.as_view(), name="2fa-setup"),
    path("2fa/verify/", TOTPVerifyView.as_view(), name="2fa-verify"),
    path("2fa/status/", TOTPStatusView.as_view(), name="2fa-status"),
    path("2fa/disable/", TOTPDisableView.as_view(), name="2fa-disable"),
]

