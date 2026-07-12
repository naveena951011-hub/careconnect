from django.conf import settings
from django.db import models


class EmergencyCategory(models.Model):
    """
    Day 7: Master-data table for emergency categories shown on the mobile
    app's category-selection screen (Medical, Fire, Security, Fall, etc).
    Admin-managed so new categories can be added without a code change.
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.CharField(max_length=255, blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text="Icon key for the mobile app, e.g. 'medical-bag'")
    is_active = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name_plural = 'Emergency Categories'
        ordering = ['display_order', 'name']

    def __str__(self):
        return self.name


class SOSAlert(models.Model):
    """
    Day 7: The core SOS/Incident model — created the instant a resident taps
    the SOS button. Day 8 adds location + message enrichment on top of the
    same row (lat/long, reverse-geocoded address, text/voice message).

    NOTE: `status` here only covers what Day 7-8 needs (an alert is either
    live or ended). The full Open->Active->Escalated->Resolved->Closed state
    machine is built in Milestone 3 / Day 15 and will extend this field.
    """

    class Status(models.TextChoices):
        TRIGGERED = 'TRIGGERED', 'Triggered'
        CANCELLED = 'CANCELLED', 'Cancelled'
        RESOLVED = 'RESOLVED', 'Resolved'

    resident = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sos_alerts',
        limit_choices_to={'role': 'RESIDENT'},
    )
    category = models.ForeignKey(
        EmergencyCategory, on_delete=models.SET_NULL, null=True, related_name='alerts',
    )
    message = models.TextField(blank=True, help_text="Free-text description typed or voice-to-text transcribed")
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.TRIGGERED)

    # Day 8: location capture
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    address = models.CharField(max_length=500, blank=True, help_text="Reverse-geocoded from lat/long")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"SOS #{self.id} - {self.resident.username} ({self.status})"


class IncidentUpdate(models.Model):
    """
    Day 8: Attach an additional text/voice message to an existing SOS after
    it's been triggered (e.g. resident adds more context, or later a
    responder posts a status note — full response-updates feed comes in
    Milestone 3 / Day 17, this is the base model it will build on).
    """

    class SourceType(models.TextChoices):
        TEXT = 'TEXT', 'Text'
        VOICE = 'VOICE', 'Voice (transcribed)'

    alert = models.ForeignKey(SOSAlert, on_delete=models.CASCADE, related_name='updates')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    source_type = models.CharField(max_length=10, choices=SourceType.choices, default=SourceType.TEXT)
    message = models.TextField()
    voice_url = models.URLField(blank=True, help_text="URL to the stored voice note, if source_type=VOICE")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Update on SOS #{self.alert_id} by {self.author}"
