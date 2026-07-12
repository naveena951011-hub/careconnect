import random
from django.conf import settings
from django.db import models
from django.utils import timezone


class EmergencyContact(models.Model):
    """
    Day 6: A single contact/guardian entry belonging to a Resident.
    Covers Primary Guardian, Secondary Guardian, and other emergency
    contacts (neighbour, doctor, relative, etc.) via `contact_type`.
    """

    class ContactType(models.TextChoices):
        PRIMARY_GUARDIAN = 'PRIMARY_GUARDIAN', 'Primary Guardian'
        SECONDARY_GUARDIAN = 'SECONDARY_GUARDIAN', 'Secondary Guardian'
        OTHER = 'OTHER', 'Other Emergency Contact'

    resident = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='emergency_contacts',
        limit_choices_to={'role': 'RESIDENT'},
    )
    contact_type = models.CharField(max_length=20, choices=ContactType.choices)

    # If the guardian already has a CareConnect account, link it (used later
    # in Milestone 2 for push/SMS/email alert routing). Optional — a contact
    # can also be a plain phone number with no app account.
    linked_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='linked_as_contact_for',
    )

    name = models.CharField(max_length=150)
    relationship = models.CharField(max_length=100, blank=True, help_text="e.g. Son, Daughter, Neighbour")
    phone_number = models.CharField(max_length=15)
    email = models.EmailField(blank=True)

    is_phone_verified = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['resident', 'contact_type']
        constraints = [
            # A resident can only have ONE primary and ONE secondary guardian
            models.UniqueConstraint(
                fields=['resident', 'contact_type'],
                condition=models.Q(contact_type='PRIMARY_GUARDIAN'),
                name='unique_primary_guardian_per_resident',
            ),
            models.UniqueConstraint(
                fields=['resident', 'contact_type'],
                condition=models.Q(contact_type='SECONDARY_GUARDIAN'),
                name='unique_secondary_guardian_per_resident',
            ),
        ]

    def __str__(self):
        return f"{self.get_contact_type_display()} for {self.resident.username}: {self.name}"


class ContactOTPVerification(models.Model):
    """
    Day 6: OTP-based verification for an emergency contact's phone or email
    (mocked here — wired to real SMS/email gateways in Milestone 2, Day 9).
    """

    class Channel(models.TextChoices):
        PHONE = 'PHONE', 'Phone'
        EMAIL = 'EMAIL', 'Email'

    contact = models.ForeignKey(EmergencyContact, on_delete=models.CASCADE, related_name='otp_verifications')
    channel = models.CharField(max_length=10, choices=Channel.choices)
    code = models.CharField(max_length=6)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    @staticmethod
    def generate_code():
        return str(random.randint(100000, 999999))

    def is_valid(self):
        return not self.is_used and self.expires_at >= timezone.now()

    def __str__(self):
        return f"OTP({self.channel}) for {self.contact.name}"
