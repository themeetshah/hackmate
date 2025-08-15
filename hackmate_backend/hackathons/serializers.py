from rest_framework import serializers
from .models import Hackathon, HackathonApplication

class HackathonSerializer(serializers.ModelSerializer):
    organizer_name = serializers.CharField(source='organizer.name', read_only=True)
    
    class Meta:
        model = Hackathon
        fields = '__all__'

class HackathonCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hackathon
        exclude = ['organizer', 'total_views', 'total_registrations', 'completion_rate', 'current_participants', 'confirmed_participants']

class HackathonApplicationSerializer(serializers.ModelSerializer):
    hackathon_title = serializers.CharField(source='hackathon.title', read_only=True)
    
    class Meta:
        model = HackathonApplication
        fields = '__all__'

class HackathonApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = HackathonApplication
        exclude = ['user', 'status', 'payment_status', 'payment_id', 'payment_deadline', 'rejection_reason', 'rejection_details', 'applied_at', 'confirmed_at', 'updated_at']
