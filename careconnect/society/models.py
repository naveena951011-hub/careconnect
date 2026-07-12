from django.db import models
from django.conf import settings


class Society(models.Model):
    """Day 4: top-level residential community entity."""
    name = models.CharField(max_length=150)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Societies'
        ordering = ['name']

    def __str__(self):
        return self.name


class Block(models.Model):
    """Day 4: a Block/Tower within a Society."""
    society = models.ForeignKey(Society, on_delete=models.CASCADE, related_name='blocks')
    name = models.CharField(max_length=50, help_text="e.g. Tower A, Block 3")
    total_floors = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ('society', 'name')
        ordering = ['society', 'name']

    def __str__(self):
        return f"{self.society.name} - {self.name}"


class Flat(models.Model):
    """Day 4: individual flat/unit within a Block."""
    block = models.ForeignKey(Block, on_delete=models.CASCADE, related_name='flats')
    flat_number = models.CharField(max_length=20, help_text="e.g. 302, B-102")
    floor = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('block', 'flat_number')
        ordering = ['block', 'flat_number']

    def __str__(self):
        return f"{self.block} - {self.flat_number}"

    @property
    def society(self):
        return self.block.society


class ResidentMapping(models.Model):
    """
    Day 5: Links a Resident user to their actual flat/block/society, and
    tracks the admin/security approval workflow for that mapping.
    """

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    resident = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='resident_mapping'
    )
    society = models.ForeignKey(Society, on_delete=models.CASCADE)
    block = models.ForeignKey(Block, on_delete=models.CASCADE)
    flat = models.ForeignKey(Flat, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='reviewed_mappings'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    requested_at = models.DateTimeField(auto_now_add=True)
    rejection_reason = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.resident.username} -> {self.flat} ({self.status})"
