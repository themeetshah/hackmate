from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

User = get_user_model()

class Team(models.Model):
    STATUS_CHOICES = [
        ('looking', 'Looking for Members'),
        ('full', 'Full Team'),
        ('inactive', 'Inactive'),
    ]
    
    # Basic Information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    hackathon = models.ForeignKey(
        'hackathons.Hackathon', 
        on_delete=models.CASCADE, 
        related_name='teams'
    )
    
    # Team Management
    team_leader = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='led_teams'
    )
    
    # FIXED: Specify through_fields to resolve ambiguity
    members = models.ManyToManyField(
        User, 
        through='TeamMembership', 
        through_fields=('team', 'user'),  # This specifies which fields to use
        related_name='teams'
    )
    
    # Team Settings
    max_members = models.PositiveIntegerField(
        default=4,
        validators=[MinValueValidator(2), MaxValueValidator(10)]
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='looking')
    
    # Skills and Requirements
    required_skills = models.JSONField(default=list, blank=True)
    looking_for_roles = models.JSONField(default=list, blank=True)
    
    # Project Information
    project_name = models.CharField(max_length=150, blank=True)
    project_idea = models.TextField(blank=True)
    github_repo = models.URLField(blank=True)
    demo_url = models.URLField(blank=True)
    
    # Team Collaboration
    allow_remote = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['name', 'hackathon']  # Unique team names within hackathon
        indexes = [
            models.Index(fields=['hackathon', 'status']),
            models.Index(fields=['team_leader', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.hackathon.title}"
    
    @property
    def current_member_count(self):
        return self.teammembership_set.filter(status='active').count()
    
    @property
    def is_full(self):
        return self.current_member_count >= self.max_members
    
    @property
    def spots_available(self):
        return max(0, self.max_members - self.current_member_count)
    
    def update_status(self):
        """Auto-update team status based on member count"""
        if self.is_full:
            self.status = 'full'
        elif self.current_member_count > 0:
            self.status = 'looking'
        else:
            self.status = 'inactive'
        self.save(update_fields=['status'])


class TeamMembership(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('declined', 'Declined'),
        ('removed', 'Removed'),
        ('left', 'Left'),
    ]
    
    ROLE_CHOICES = [
        ('leader', 'Team Leader'),
        ('co-leader', 'Co-Leader'),
        ('member', 'Member'),
    ]
    
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='team_memberships')
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Skills this member brings to the team
    skills_contribution = models.JSONField(default=list, blank=True)
    preferred_role_in_project = models.CharField(max_length=100, blank=True)
    
    # Membership timeline
    invited_at = models.DateTimeField(auto_now_add=True)
    joined_at = models.DateTimeField(null=True, blank=True)
    left_at = models.DateTimeField(null=True, blank=True)
    
    # Invitation details - this creates the second FK to User that caused the issue
    invited_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='sent_team_invitations'  # Different related_name to avoid conflicts
    )
    invitation_message = models.TextField(blank=True)
    
    class Meta:
        unique_together = ['team', 'user']
        ordering = ['-invited_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['team', 'status']),
        ]
    
    def __str__(self):
        return f"{self.user.name} in {self.team.name} ({self.status})"


class TeamInvitation(models.Model):
    STATUS_CHOICES = [
        ('leader_pending', 'Waiting for Leader Approval'),
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('rejected', 'Rejected by Leader'),
        ('expired', 'Expired'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='invitations')
    inviter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_invitations')
    invitee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_invitations')
    
    message = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    created_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField()  # Auto-set to 7 days from creation
    
    class Meta:
        unique_together = ['team', 'invitee']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Invitation to {self.invitee.name} for {self.team.name}"


class TeamMessage(models.Model):
    MESSAGE_TYPES = [
        ('text', 'Text'),
        ('file', 'File'),
        ('image', 'Image'),
        ('system', 'System'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='team_messages')
    
    content = models.TextField()
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPES, default='text')
    
    # File attachment (optional)
    file_attachment = models.FileField(upload_to='team_files/', blank=True, null=True)
    file_name = models.CharField(max_length=255, blank=True)
    file_size = models.PositiveIntegerField(default=0)
    
    # Message metadata
    is_edited = models.BooleanField(default=False)
    edited_at = models.DateTimeField(null=True, blank=True)
    
    # Reply to another message (optional)
    reply_to = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['team', '-created_at']),
            models.Index(fields=['sender', '-created_at']),
        ]
    
    def __str__(self):
        return f"Message by {self.sender.name} in {self.team.name}"
