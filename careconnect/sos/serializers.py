from rest_framework import serializers
from .models import EmergencyCategory, SOSAlert, IncidentUpdate


class EmergencyCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyCategory
        fields = ['id', 'name', 'description', 'icon', 'is_active', 'display_order']


def mock_reverse_geocode(latitude, longitude):
    """
    Day 8: Reverse-geocoding stub. Real integration (Google Maps / OSM
    Nominatim) is dropped in here later without touching callers — same
    mocking pattern used for OTP delivery elsewhere in the project.
    """
    if latitude is None or longitude is None:
        return ''
    return f"Approx. location near {latitude:.4f}, {longitude:.4f}"


class SOSAlertCreateSerializer(serializers.ModelSerializer):
    """
    Day 7: One-Tap SOS creation. Day 8 adds latitude/longitude capture and
    server-side reverse geocoding into `address`.
    POST /api/sos/alerts/  Body: {category, message, latitude, longitude}
    """

    class Meta:
        model = SOSAlert
        fields = ['id', 'category', 'message', 'latitude', 'longitude', 'address', 'status', 'created_at']
        read_only_fields = ['id', 'address', 'status', 'created_at']

    def create(self, validated_data):
        validated_data['address'] = mock_reverse_geocode(
            validated_data.get('latitude'), validated_data.get('longitude')
        )
        validated_data['resident'] = self.context['request'].user
        return super().create(validated_data)


class SOSAlertDetailSerializer(serializers.ModelSerializer):
    resident_name = serializers.CharField(source='resident.username', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = SOSAlert
        fields = [
            'id', 'resident', 'resident_name', 'category', 'category_name', 'message',
            'status', 'latitude', 'longitude', 'address', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'resident', 'created_at', 'updated_at']


class IncidentUpdateSerializer(serializers.ModelSerializer):
    """Day 8: attach a text/voice message to an existing SOS."""
    author_name = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = IncidentUpdate
        fields = ['id', 'alert', 'author', 'author_name', 'source_type', 'message', 'voice_url', 'created_at']
        read_only_fields = ['id', 'alert', 'author', 'author_name', 'created_at']
