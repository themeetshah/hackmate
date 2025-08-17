from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from .models import Team, TeamMembership, TeamInvitation, TeamMessage
from hackathons.models import Hackathon, HackathonApplication

User = get_user_model()

class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'experience_level', 'skills', 'github_url', 'average_rating']

class TeamMembershipSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = TeamMembership
        fields = [
            'id', 'user', 'role', 'status', 'skills_contribution', 
            'preferred_role_in_project', 'invited_at', 'joined_at'
        ]

class TeamListSerializer(serializers.ModelSerializer):
    team_leader = UserBasicSerializer(read_only=True)
    current_member_count = serializers.ReadOnlyField()
    spots_available = serializers.ReadOnlyField()
    hackathon_title = serializers.CharField(source='hackathon.title', read_only=True)
    
    class Meta:
        model = Team
        fields = [
            'id', 'name', 'description', 'hackathon', 'hackathon_title',
            'team_leader', 'max_members', 'current_member_count', 'spots_available',
            'status', 'privacy', 'required_skills', 'looking_for_roles',
            'project_name', 'allow_remote', 'created_at'
        ]

class TeamDetailSerializer(serializers.ModelSerializer):
    team_leader = UserBasicSerializer(read_only=True)
    members = TeamMembershipSerializer(source='teammembership_set', many=True, read_only=True)
    current_member_count = serializers.ReadOnlyField()
    spots_available = serializers.ReadOnlyField()
    hackathon_title = serializers.CharField(source='hackathon.title', read_only=True)
    hackathon_status = serializers.CharField(source='hackathon.status', read_only=True)
    
    class Meta:
        model = Team
        fields = [
            'id', 'name', 'description', 'hackathon', 'hackathon_title', 'hackathon_status',
            'team_leader', 'members', 'max_members', 'current_member_count', 'spots_available',
            'status', 'privacy', 'required_skills', 'looking_for_roles',
            'project_name', 'project_idea', 'github_repo', 'demo_url',
            'allow_remote', 'preferred_timezone', 'communication_platform',
            'created_at', 'updated_at'
        ]

class TeamCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = [
            'name', 'description', 'hackathon', 'max_members',
            'privacy', 'required_skills', 'looking_for_roles',
            'project_name', 'project_idea', 'allow_remote',
            'preferred_timezone', 'communication_platform'
        ]
    
    def validate_hackathon(self, value):
        user = self.context['request'].user
        
        # Check if user has applied to this hackathon
        if not HackathonApplication.objects.filter(
            user=user, 
            hackathon=value, 
            status__in=['applied', 'confirmed', 'payment_pending']
        ).exists():
            raise serializers.ValidationError(
                "You can only create teams for hackathons you've applied to."
            )
        
        return value
    
    def validate_name(self, value):
        hackathon = self.initial_data.get('hackathon')
        if hackathon and Team.objects.filter(name=value, hackathon=hackathon).exists():
            raise serializers.ValidationError(
                "A team with this name already exists in this hackathon."
            )
        return value
    
    def create(self, validated_data):
        user = self.context['request'].user
        team = Team.objects.create(team_leader=user, **validated_data)
        
        # Add team leader as active member
        TeamMembership.objects.create(
            team=team,
            user=user,
            role='leader',
            status='active',
            joined_at=timezone.now()
        )
        
        return team

class TeamInvitationSerializer(serializers.ModelSerializer):
    inviter = UserBasicSerializer(read_only=True)
    invitee = UserBasicSerializer(read_only=True)
    team_name = serializers.CharField(source='team.name', read_only=True)
    hackathon_title = serializers.CharField(source='team.hackathon.title', read_only=True)
    
    class Meta:
        model = TeamInvitation
        fields = [
            'id', 'team', 'team_name', 'hackathon_title',
            'inviter', 'invitee', 'message', 'status',
            'created_at', 'responded_at', 'expires_at'
        ]

class TeamInvitationCreateSerializer(serializers.ModelSerializer):
    invitee_email = serializers.EmailField(write_only=True)
    
    class Meta:
        model = TeamInvitation
        fields = ['team', 'invitee_email', 'message']
    
    def validate(self, attrs):
        team = attrs['team']
        invitee_email = attrs['invitee_email']
        
        # Check if team is full
        if team.is_full:
            raise serializers.ValidationError("Team is already full.")
        
        # Get invitee user
        try:
            invitee = User.objects.get(email=invitee_email)
        except User.DoesNotExist:
            raise serializers.ValidationError("User with this email does not exist.")
        
        # Check if user is already a member
        if TeamMembership.objects.filter(team=team, user=invitee, status='active').exists():
            raise serializers.ValidationError("User is already a member of this team.")
        
        # Check if invitation already exists
        if TeamInvitation.objects.filter(
            team=team, 
            invitee=invitee, 
            status='pending'
        ).exists():
            raise serializers.ValidationError("Invitation already sent to this user.")
        
        attrs['invitee'] = invitee
        return attrs
    
    def create(self, validated_data):
        invitee_email = validated_data.pop('invitee_email')
        invitee = validated_data.pop('invitee')
        
        invitation = TeamInvitation.objects.create(
            inviter=self.context['request'].user,
            invitee=invitee,
            expires_at=timezone.now() + timedelta(days=7),
            **validated_data
        )
        
        return invitation

class TeamMessageSerializer(serializers.ModelSerializer):
    sender = UserBasicSerializer(read_only=True)
    sender_name = serializers.CharField(source='sender.name', read_only=True)
    
    class Meta:
        model = TeamMessage
        fields = [
            'id', 'team', 'sender', 'sender_name', 'content',
            'message_type', 'file_attachment', 'file_name', 'file_size',
            'is_edited', 'edited_at', 'reply_to', 'created_at'
        ]
        read_only_fields = ['sender', 'is_edited', 'edited_at']
    
    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)
