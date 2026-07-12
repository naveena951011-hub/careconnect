from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from datetime import timedelta
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import (
    User, ResidentProfile, GuardianProfile, VolunteerProfile,
    SecurityProfile, OTPVerification,
)


class ResidentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResidentProfile
        fields = ['society', 'block', 'flat', 'date_of_birth', 'is_dependent']


class GuardianProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = GuardianProfile
        fields = ['relationship_to_resident', 'occupation']


class VolunteerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerProfile
        fields = ['society', 'skills', 'is_available']


class SecurityProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = SecurityProfile
        fields = ['society', 'shift_start', 'shift_end', 'badge_number']


PROFILE_SERIALIZER_MAP = {
    User.Role.RESIDENT: ResidentProfileSerializer,
    User.Role.GUARDIAN: GuardianProfileSerializer,
    User.Role.VOLUNTEER: VolunteerProfileSerializer,
    User.Role.SECURITY: SecurityProfileSerializer,
}
PROFILE_MODEL_MAP = {
    User.Role.RESIDENT: ResidentProfile,
    User.Role.GUARDIAN: GuardianProfile,
    User.Role.VOLUNTEER: VolunteerProfile,
    User.Role.SECURITY: SecurityProfile,
}


class RegisterSerializer(serializers.ModelSerializer):
    """
    Day 3: Single registration endpoint that accepts a `role` plus a
    `profile` object whose shape depends on the role (resident-flat details,
    security-shift details, etc). Validates and creates both the User and
    the correct role-specific profile row in one transaction.
    """
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)
    profile = serializers.DictField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'phone_number', 'first_name', 'last_name',
            'role', 'password', 'confirm_password', 'profile',
        ]

    def validate_role(self, value):
        if value == User.Role.ADMIN:
            raise serializers.ValidationError("Admin accounts cannot self-register.")
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('confirm_password'):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', {})
        password = validated_data.pop('password')
        role = validated_data['role']

        user = User(**validated_data)
        user.set_password(password)
        user.approval_status = User.ApprovalStatus.PENDING
        user.save()

        profile_model = PROFILE_MODEL_MAP.get(role)
        if profile_model:
            profile_serializer_cls = PROFILE_SERIALIZER_MAP[role]
            profile_serializer = profile_serializer_cls(data=profile_data)
            profile_serializer.is_valid(raise_exception=True)
            profile_model.objects.create(user=user, **profile_serializer.validated_data)

        # Day 3: OTP/email verification stub (mocked — see notification engine, Day 9)
        OTPVerification.objects.create(
            user=user,
            code=OTPVerification.generate_code(),
            purpose=OTPVerification.Purpose.PHONE,
            expires_at=timezone.now() + timedelta(minutes=10),
        )

        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Day 2: JWT login — embeds role & approval_status in the token payload."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['approval_status'] = user.approval_status
        token['username'] = user.username
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['role'] = self.user.role
        data['approval_status'] = self.user.approval_status
        data['user_id'] = self.user.id
        return data


class OTPVerifySerializer(serializers.Serializer):
    """Day 3: confirms the mocked OTP sent at registration time."""
    user_id = serializers.IntegerField()
    code = serializers.CharField(max_length=6)
    purpose = serializers.ChoiceField(choices=OTPVerification.Purpose.choices)

    def validate(self, attrs):
        try:
            otp = OTPVerification.objects.filter(
                user_id=attrs['user_id'],
                purpose=attrs['purpose'],
                is_used=False,
            ).latest('created_at')
        except OTPVerification.DoesNotExist:
            raise serializers.ValidationError("No pending OTP found for this user.")

        if otp.code != attrs['code']:
            raise serializers.ValidationError("Invalid OTP code.")
        if otp.expires_at < timezone.now():
            raise serializers.ValidationError("OTP has expired.")

        attrs['otp'] = otp
        return attrs


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'phone_number', 'first_name', 'last_name',
            'role', 'approval_status', 'is_phone_verified', 'is_email_verified',
            'created_at',
        ]
        read_only_fields = ['id', 'role', 'approval_status', 'created_at']
