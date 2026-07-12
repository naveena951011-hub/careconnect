import random
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Day 2: Custom User model with a role field.
    Every role (Resident, Guardian, Volunteer, Security, Admin) uses this
    same model + JWT auth; role-specific extra fields live in the profile
    models below (one-to-one), created at registration time (Day 3).
    """

    class Role(models.TextChoices):
        RESIDENT = 'RESIDENT', 'Resident'
        GUARDIAN = 'GUARDIAN', 'Guardian'
        VOLUNTEER = 'VOLUNTEER', 'Volunteer'
        SECURITY = 'SECURITY', 'Security'
        ADMIN = 'ADMIN', 'Admin'

    class ApprovalStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    role = models.CharField(max_length=20, choices=Role.choices)
    phone_number = models.CharField(max_length=15, unique=True)
    is_phone_verified = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)

    # Admin/security approval workflow (Day 5) - applies mainly to Resident
    approval_status = models.CharField(
        max_length=10, choices=ApprovalStatus.choices, default=ApprovalStatus.PENDING
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    REQUIRED_FIELDS = ['email', 'phone_number', 'role']

    def __str__(self):
        return f"{self.username} ({self.role})"


class ResidentProfile(models.Model):
    """Day 3: Resident-specific registration fields."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='resident_profile')
    society = models.ForeignKey('society.Society', on_delete=models.SET_NULL, null=True, blank=True)
    block = models.ForeignKey('society.Block', on_delete=models.SET_NULL, null=True, blank=True)
    flat = models.ForeignKey('society.Flat', on_delete=models.SET_NULL, null=True, blank=True,
                              related_name='residents')
    date_of_birth = models.DateField(null=True, blank=True)
    is_dependent = models.BooleanField(default=False, help_text="Senior citizen / child / dependent flag")

    def __str__(self):
        return f"Resident: {self.user.username}"


class GuardianProfile(models.Model):
    """Day 3: Guardian-specific registration fields."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='guardian_profile')
    relationship_to_resident = models.CharField(max_length=50, blank=True)
    occupation = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"Guardian: {self.user.username}"


class VolunteerProfile(models.Model):
    """Day 3: Volunteer-specific registration fields."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='volunteer_profile')
    society = models.ForeignKey('society.Society', on_delete=models.SET_NULL, null=True, blank=True)
    skills = models.CharField(max_length=255, blank=True, help_text="e.g. First Aid, Driving")
    is_available = models.BooleanField(default=True)  # used later in Day 12

    def __str__(self):
        return f"Volunteer: {self.user.username}"


class SecurityProfile(models.Model):
    """Day 3: Security personnel-specific registration fields."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='security_profile')
    society = models.ForeignKey('society.Society', on_delete=models.SET_NULL, null=True, blank=True)
    shift_start = models.TimeField(null=True, blank=True)
    shift_end = models.TimeField(null=True, blank=True)
    badge_number = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return f"Security: {self.user.username}"


class OTPVerification(models.Model):
    """
    Day 3: OTP / email verification stub. Mocked for now — in production this
    would be sent via SMS gateway / SendGrid (wired up properly in Day 9).
    """

    class Purpose(models.TextChoices):
        PHONE = 'PHONE', 'Phone Verification'
        EMAIL = 'EMAIL', 'Email Verification'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='otp_verifications')
    code = models.CharField(max_length=6)
    purpose = models.CharField(max_length=10, choices=Purpose.choices)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    @staticmethod
    def generate_code():
        return str(random.randint(100000, 999999))

    def __str__(self):
        return f"OTP({self.purpose}) for {self.user.username}"
