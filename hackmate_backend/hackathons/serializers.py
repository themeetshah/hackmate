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
    user_name = serializers.CharField(source='user.name', read_only=True)
    
    class Meta:
        model = HackathonApplication
        fields = '__all__'

class HackathonApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = HackathonApplication
        # Only exclude fields that should be auto-generated or computed
        exclude = [
            'user',  # Set by view
            'payment_id', 
            'amount_paid', 
            'payment_deadline', 
            'rejection_reason', 
            'rejection_details', 
            'applied_at',  # Auto-generated
            'confirmed_at', 
            'updated_at'  # Auto-generated
        ]
        
    def validate(self, data):
        """Custom validation for application data"""
        hackathon = data.get('hackathon')
        application_type = data.get('application_type', 'individual')
        
        if hackathon:
            # Validate team size constraints
            if application_type == 'team_leader':
                preferred_team_size = data.get('preferred_team_size')
                if preferred_team_size:
                    if preferred_team_size < hackathon.min_team_size:
                        raise serializers.ValidationError(
                            f'Team size must be at least {hackathon.min_team_size} members'
                        )
                    if preferred_team_size > hackathon.max_team_size:
                        raise serializers.ValidationError(
                            f'Team size cannot exceed {hackathon.max_team_size} members'
                        )
            
            # Validate registration capacity
            if hackathon.confirmed_participants >= hackathon.max_participants:
                raise serializers.ValidationError('This hackathon is full')
                
        return data


# hackathons/serializers.py

class HackathonApplicationUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = HackathonApplication
        fields = ['status', 'payment_status', 'amount_paid', 'payment_id', 'confirmed_at']
        
    def validate(self, data):
        """Validate payment update"""
        if data.get('status') == 'confirmed' and not data.get('amount_paid'):
            raise serializers.ValidationError('Amount paid is required for confirmed status')
        return data