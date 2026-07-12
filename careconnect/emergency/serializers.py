from datetime import timedelta
from django.utils import timezone
from rest_framework import serializers

from .models import EmergencyContact, ContactOTPVerification


class EmergencyContactSerializer(serializers.ModelSerializer):
    """
    Day 6: Create/list/update emergency contacts (primary/secondary guardian
    or other). `resident` is always forced to request.user in the view, so
    residents can never create contacts for someone else.
    """

    class Meta:
        model = EmergencyContact
        fields = [
            'id', 'contact_type', 'linked_user', 'name', 'relationship',
            'phone_number', 'email', 'is_phone_verified', 'is_email_verified',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'is_phone_verified', 'is_email_verified', 'created_at', 'updated_at']

    def validate(self, attrs):
        contact_type = attrs.get('contact_type', getattr(self.instance, 'contact_type', None))

        # Enforce "one Primary Guardian / one Secondary Guardian per resident"
        # at the API layer too (the DB UniqueConstraint is the last line of
        # defense, but a clean 400 here is much friendlier than a 500).
        request = self.context.get('request')
        if request and contact_type in (
            EmergencyContact.ContactType.PRIMARY_GUARDIAN,
            EmergencyContact.ContactType.SECONDARY_GUARDIAN,
        ):
            existing = EmergencyContact.objects.filter(
                resident=request.user, contact_type=contact_type,
            )
            if self.instance:
                existing = existing.exclude(pk=self.instance.pk)
            if existing.exists():
                raise serializers.ValidationError({
                    'contact_type': f"A {contact_type.replace('_', ' ').title()} is already configured. "
                                     f"Update the existing one instead of creating a new one.",
                })
        return attrs


class SendContactOTPSerializer(serializers.Serializer):
    """Day 6: POST /api/emergency/contacts/<id>/send-otp/  Body: { channel }"""
    channel = serializers.ChoiceField(choices=ContactOTPVerification.Channel.choices)

    def create(self, validated_data):
        contact = self.context['contact']
        otp = ContactOTPVerification.objects.create(
            contact=contact,
            channel=validated_data['channel'],
            code=ContactOTPVerification.generate_code(),
            expires_at=timezone.now() + timedelta(minutes=10),
        )
        return otp


class VerifyContactOTPSerializer(serializers.Serializer):
    """Day 6: POST /api/emergency/contacts/<id>/verify-otp/  Body: { channel, code }"""
    channel = serializers.ChoiceField(choices=ContactOTPVerification.Channel.choices)
    code = serializers.CharField(max_length=6)

    def validate(self, attrs):
        contact = self.context['contact']
        try:
            otp = ContactOTPVerification.objects.filter(
                contact=contact, channel=attrs['channel'], is_used=False,
            ).latest('created_at')
        except ContactOTPVerification.DoesNotExist:
            raise serializers.ValidationError("No pending OTP found for this contact/channel.")

        if otp.code != attrs['code']:
            raise serializers.ValidationError("Invalid OTP code.")
        if not otp.is_valid():
            raise serializers.ValidationError("OTP has expired.")

        attrs['otp'] = otp
        return attrs
