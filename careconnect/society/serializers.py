from rest_framework import serializers
from users.models import User
from .models import Society, Block, Flat, ResidentMapping


class SocietySerializer(serializers.ModelSerializer):
    class Meta:
        model = Society
        fields = '__all__'


class BlockSerializer(serializers.ModelSerializer):
    society_name = serializers.CharField(source='society.name', read_only=True)

    class Meta:
        model = Block
        fields = ['id', 'society', 'society_name', 'name', 'total_floors']


class FlatSerializer(serializers.ModelSerializer):
    block_name = serializers.CharField(source='block.name', read_only=True)
    society_name = serializers.CharField(source='block.society.name', read_only=True)
    is_occupied = serializers.SerializerMethodField()

    class Meta:
        model = Flat
        fields = ['id', 'block', 'block_name', 'society_name', 'flat_number', 'floor', 'is_occupied']

    def get_is_occupied(self, obj):
        # Occupancy is determined by the Day-5 approval workflow (ResidentMapping),
        # not by the denormalized ResidentProfile.flat set at registration time.
        return ResidentMapping.objects.filter(
            flat=obj, status=ResidentMapping.Status.APPROVED
        ).exists()


class ResidentMappingRequestSerializer(serializers.ModelSerializer):
    """Day 5: Resident submits which flat/block/society they belong to."""

    class Meta:
        model = ResidentMapping
        fields = ['id', 'society', 'block', 'flat', 'status', 'requested_at']
        read_only_fields = ['id', 'status', 'requested_at']

    def validate(self, attrs):
        if attrs['block'].society_id != attrs['society'].id:
            raise serializers.ValidationError("Selected block does not belong to the selected society.")
        if attrs['flat'].block_id != attrs['block'].id:
            raise serializers.ValidationError("Selected flat does not belong to the selected block.")
        return attrs

    def create(self, validated_data):
        request = self.context['request']
        mapping, _ = ResidentMapping.objects.update_or_create(
            resident=request.user,
            defaults={**validated_data, 'status': ResidentMapping.Status.PENDING},
        )
        return mapping


class ResidentMappingReviewSerializer(serializers.ModelSerializer):
    """Day 5: Admin/Security approves or rejects a resident's mapping request."""

    class Meta:
        model = ResidentMapping
        fields = ['status', 'rejection_reason']

    def validate_status(self, value):
        if value not in (ResidentMapping.Status.APPROVED, ResidentMapping.Status.REJECTED):
            raise serializers.ValidationError("Status must be APPROVED or REJECTED.")
        return value


class ResidentDirectoryEntrySerializer(serializers.ModelSerializer):
    """Day 5: searchable resident directory entry."""
    username = serializers.CharField(source='resident.username', read_only=True)
    full_name = serializers.SerializerMethodField()
    phone_number = serializers.CharField(source='resident.phone_number', read_only=True)
    flat_number = serializers.CharField(source='flat.flat_number', read_only=True)
    block_name = serializers.CharField(source='block.name', read_only=True)
    society_name = serializers.CharField(source='society.name', read_only=True)

    class Meta:
        model = ResidentMapping
        fields = [
            'id', 'username', 'full_name', 'phone_number',
            'society_name', 'block_name', 'flat_number', 'status',
        ]

    def get_full_name(self, obj):
        return f"{obj.resident.first_name} {obj.resident.last_name}".strip()
