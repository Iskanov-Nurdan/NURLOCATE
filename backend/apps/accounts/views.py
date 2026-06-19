from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import UserProfile
from .serializers import RegisterSerializer, UserProfileSerializer, UserSerializer
from .throttles import AuthRateThrottle


class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthRateThrottle]
    serializer_class = RegisterSerializer


class LoginView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthRateThrottle]


class RefreshView(TokenRefreshView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthRateThrottle]


class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        allowed = {"first_name", "last_name", "email"}
        for field in allowed:
            if field in serializer.validated_data:
                setattr(request.user, field, serializer.validated_data[field])
        request.user.save(update_fields=[f for f in allowed if f in serializer.validated_data])
        return Response(UserSerializer(request.user).data)


class LogoutView(APIView):
    def post(self, request):
        return Response({"detail": "Client should remove stored JWT tokens."})


class ProfileView(APIView):
    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        return Response(UserProfileSerializer(profile).data)

    def patch(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class FCMTokenView(APIView):
    def post(self, request):
        token = request.data.get("fcm_token", "")
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        profile.fcm_token = token
        profile.save(update_fields=["fcm_token"])
        return Response({"detail": "FCM token updated."})

