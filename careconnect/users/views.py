from django.utils import timezone
from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import (
    RegisterSerializer, CustomTokenObtainPairSerializer,
    OTPVerifySerializer, UserSerializer,
)


class RegisterView(generics.CreateAPIView):
    """
    Day 3: POST /api/auth/register/
    Body: { username, email, phone_number, first_name, last_name, role,
            password, confirm_password, profile: {...role-specific fields} }
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                "message": "Registration successful. Please verify your phone number with the OTP sent.",
                "user_id": user.id,
                "role": user.role,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(TokenObtainPairView):
    """Day 2: POST /api/auth/login/ — returns access + refresh JWT tokens."""
    serializer_class = CustomTokenObtainPairSerializer


class LogoutView(APIView):
    """Day 2: POST /api/auth/logout/  Body: { refresh: <refresh_token> }"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logged out successfully."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response({"error": "Invalid or missing refresh token."}, status=status.HTTP_400_BAD_REQUEST)


class VerifyOTPView(APIView):
    """Day 3: POST /api/auth/verify-otp/ Body: { user_id, code, purpose }"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        otp = serializer.validated_data['otp']
        otp.is_used = True
        otp.save(update_fields=['is_used'])

        user = otp.user
        if otp.purpose == otp.Purpose.PHONE:
            user.is_phone_verified = True
        else:
            user.is_email_verified = True
        user.save(update_fields=['is_phone_verified', 'is_email_verified'])

        return Response({"message": "Verification successful."}, status=status.HTTP_200_OK)


class MeView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/auth/me/ — the logged-in user's own profile."""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
