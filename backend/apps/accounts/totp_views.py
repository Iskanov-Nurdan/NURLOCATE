import pyotp
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AdminTOTP


class TOTPSetupView(APIView):
    def post(self, request):
        if not (request.user.is_staff or request.user.is_superuser):
            return Response({"detail": "Admin only."}, status=403)
        totp_obj, created = AdminTOTP.objects.get_or_create(
            user=request.user,
            defaults={"secret": pyotp.random_base32(), "is_verified": False},
        )
        if not totp_obj.secret:
            totp_obj.secret = pyotp.random_base32()
            totp_obj.save(update_fields=["secret"])
        totp = pyotp.TOTP(totp_obj.secret)
        provisioning_uri = totp.provisioning_uri(
            name=request.user.email or request.user.username,
            issuer_name="PetTrack OS",
        )
        return Response({
            "secret": totp_obj.secret,
            "provisioning_uri": provisioning_uri,
            "is_verified": totp_obj.is_verified,
        })


class TOTPVerifyView(APIView):
    def post(self, request):
        if not (request.user.is_staff or request.user.is_superuser):
            return Response({"detail": "Admin only."}, status=403)
        code = request.data.get("code", "")
        totp_obj = AdminTOTP.objects.filter(user=request.user).first()
        if not totp_obj:
            return Response({"detail": "2FA not set up. Call POST /auth/2fa/setup/ first."}, status=400)
        totp = pyotp.TOTP(totp_obj.secret)
        if totp.verify(str(code), valid_window=1):
            totp_obj.is_verified = True
            totp_obj.save(update_fields=["is_verified"])
            return Response({"detail": "2FA verified successfully."})
        return Response({"detail": "Invalid code."}, status=400)


class TOTPStatusView(APIView):
    def get(self, request):
        if not (request.user.is_staff or request.user.is_superuser):
            return Response({"detail": "Admin only."}, status=403)
        totp_obj = AdminTOTP.objects.filter(user=request.user).first()
        return Response({
            "enabled": totp_obj is not None,
            "verified": totp_obj.is_verified if totp_obj else False,
        })


class TOTPDisableView(APIView):
    def post(self, request):
        if not request.user.is_superuser:
            return Response({"detail": "SuperAdmin only."}, status=403)
        AdminTOTP.objects.filter(user=request.user).delete()
        return Response({"detail": "2FA disabled."})
