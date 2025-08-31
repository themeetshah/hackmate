from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.urls import reverse
import uuid


User = get_user_model()


# Choices moved outside the class
STATUS_CHOICES = [
    ('draft', 'Draft'),
    ('published', 'Published'),
    ('registration_open', 'Registration Open'),
    ('registration_closed', 'Registration Closed'),
    ('ongoing', 'Ongoing'),
    ('completed', 'Completed'),
    ('cancelled', 'Cancelled'),
]


REGISTRATION_TYPE_CHOICES = [
    ('individual', 'Individual Only'),
    ('team', 'Team Only'),
    ('both', 'Individual & Team'),
]


DIFFICULTY_CHOICES = [
    ('beginner', 'Beginner'),
    ('intermediate', 'Intermediate'),
    ('advanced', 'Advanced'),
    ('expert', 'Expert'),
]


MODE_CHOICES = [
    ('online', 'Online'),
    ('offline', 'Offline'),
    ('hybrid', 'Hybrid'),
]


APPROVAL_CHOICES = [
    ('pending', 'Pending'),
    ('approved', 'Approved'),
    ('rejected', 'Rejected'),
]


class Hackathon(models.Model):
    # Basic Information
    title = models.CharField(max_length=200)
    description = models.TextField(default="",null=True, blank=True)
    organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='organized_hackathons')
    
    # Categories and Tags (as JSON fields)
    categories = models.JSONField(default=list, help_text="e.g., ['AI/ML', 'Web Dev', 'Mobile Apps']")
    tech_stack = models.JSONField(default=list, help_text="e.g., ['React', 'Python', 'TensorFlow']")
    themes = models.JSONField(default=list, help_text="e.g., ['Healthcare', 'Education', 'Environment']")
    
    # Timing
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    registration_start = models.DateTimeField()
    registration_end = models.DateTimeField()
    
    # Registration Settings
    registration_type = models.CharField(max_length=20, choices=REGISTRATION_TYPE_CHOICES, default='both')
    max_participants = models.IntegerField()
    min_team_size = models.IntegerField(default=1)
    max_team_size = models.IntegerField(default=4)
    current_participants = models.IntegerField(default=0)
    confirmed_participants = models.IntegerField(default=0)  # New field for confirmed participants
    
    # Event Details
    mode = models.CharField(max_length=20, choices=MODE_CHOICES, default='online')
    venue = models.TextField(blank=True, help_text="For offline/hybrid events")
    meeting_link = models.URLField(blank=True, help_text="For online events")
    difficulty_level = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='beginner')
    
    # Prizes and Rewards
    prizes = models.JSONField(default=dict, help_text="{'first': 50000, 'second': 30000}")
    total_prize_pool = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Approval and Status
    approval_status = models.CharField(max_length=10, choices=APPROVAL_CHOICES, default='pending', help_text="Admin approval status")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    is_featured = models.BooleanField(default=False)
    is_free = models.BooleanField(default=True)
    registration_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    
    # Winner Declaration
    winners_declared = models.BooleanField(default=False)
    results_announcement = models.TextField(blank=True)
    
    # Analytics and Tracking
    total_views = models.IntegerField(default=0)
    total_registrations = models.IntegerField(default=0)
    completion_rate = models.FloatField(default=0.0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['organizer', '-created_at']),
        ]
    
    def __str__(self):
        return self.title
    
    def get_absolute_url(self):
        return reverse('hackathons:detail', kwargs={'id': self.id})
    
    def update_status_based_on_dates(self):
        """Auto-update status based on current time and dates"""
        now = timezone.now()
        
        if now < self.registration_start:
            if self.status == 'published':
                return  # Keep as published until registration opens
        elif self.registration_start <= now <= self.registration_end:
            if self.confirmed_participants < self.max_participants:
                self.status = 'registration_open'
            else:
                self.status = 'registration_closed'
        elif now > self.registration_end and now < self.start_date:
            self.status = 'registration_closed'
        elif self.start_date <= now <= self.end_date:
            self.status = 'ongoing'
        elif now > self.end_date:
            self.status = 'completed'
        
        self.save(update_fields=['status'])
    
    @property
    def is_registration_open(self):
        now = timezone.now()
        print(now, self.registration_start, self.registration_end)
        return (self.registration_start <= now <= self.registration_end and 
                self.status in ['published', 'registration_open'] and
                self.confirmed_participants < self.max_participants)
    
    @property
    def is_ongoing(self):
        now = timezone.now()
        return self.start_date <= now <= self.end_date
    
    @property
    def is_completed(self):
        return timezone.now() > self.end_date
    
    @property
    def time_until_start(self):
        if self.start_date > timezone.now():
            return self.start_date - timezone.now()
        return None
    
    @property
    def time_until_end(self):
        if self.end_date > timezone.now():
            return self.end_date - timezone.now()
        return None
    
    @property
    def registration_spots_left(self):
        return max(0, self.max_participants - self.confirmed_participants)


class HackathonApplication(models.Model):
    APPLICATION_TYPE_CHOICES = [
        ('individual', 'Individual'),
        ('team_leader', 'Team Leader'),
    ]
    
    STATUS_CHOICES = [
        ('applied', 'Applied'),           # Initial application
        ('team_pending', 'Team Pending'), # Team leader registered, waiting for team formation
        ('payment_pending', 'Payment Pending'),  # For paid hackathons
        ('confirmed', 'Confirmed'),       # Payment done + confirmed by organizer
        ('rejected', 'Rejected'),         # Rejected by organizer
        ('cancelled', 'Cancelled'),       # Cancelled by user
    ]
    
    REJECTION_REASON_CHOICES = [
        ('max_participants_reached', 'Maximum participants reached'),
        ('payment_not_completed', 'Payment not completed within deadline'),
        ('incomplete_profile', 'Incomplete user profile'),
        ('skill_mismatch', 'Skills do not match hackathon requirements'),
        ('duplicate_application', 'Duplicate application detected'),
        ('organizer_decision', 'Organizer decision'),
        ('other', 'Other reason'),
    ]
    
    # Core Application Info
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='hackathon_applications')
    hackathon = models.ForeignKey(Hackathon, on_delete=models.CASCADE, related_name='applications')
    
    application_type = models.CharField(max_length=20, choices=APPLICATION_TYPE_CHOICES, default='individual')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='applied')
    
    # Application Details (minimal - most fetched from user profile)
    skills_bringing = models.JSONField(default=list, help_text="Specific skills for this hackathon")
    
    # Team Formation Preferences
    looking_for_team = models.BooleanField(default=False, help_text="Are you looking to join a team?")
    preferred_team_size = models.IntegerField(null=True, blank=True, help_text="Preferred team size")
    preferred_roles = models.JSONField(default=list, help_text="Roles you want in your team")
    open_to_remote_collaboration = models.BooleanField(default=True)
    
    # Project Ideas
    project_ideas = models.TextField(blank=True, help_text="Any initial project ideas you have")
    
    # Payment Info
    payment_status = models.CharField(
        max_length=20,
        choices=[
            ('not_required', 'Not Required'),
            ('pending', 'Pending'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
            ('refunded', 'Refunded'),
        ],
        default='not_required'
    )
    payment_id = models.CharField(max_length=100, blank=True)
    amount_paid = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    payment_deadline = models.DateTimeField(null=True, blank=True)
    
    # Rejection handling
    rejection_reason = models.CharField(
        max_length=50, 
        choices=REJECTION_REASON_CHOICES, 
        blank=True,
        help_text="Reason for rejection"
    )
    rejection_details = models.TextField(blank=True, help_text="Additional rejection details")
    
    # Application Timeline
    applied_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'hackathon']
        ordering = ['-applied_at']
        indexes = [
            models.Index(fields=['hackathon', 'status']),
            models.Index(fields=['user', '-applied_at']),
            models.Index(fields=['status', 'payment_status']),
        ]
    
    def __str__(self):
        return f"{self.user.name} - {self.hackathon.title}"
    
    # Properties fetched from user profile
    @property
    def user_experience_level(self):
        return self.user.experience_level
    
    @property
    def user_previous_hackathons(self):
        return self.user.total_hackathons_participated
    
    @property
    def user_skills(self):
        return self.user.skills
    
    @property
    def user_interests(self):
        return self.user.interests
    
    # Status checks
    @property
    def is_confirmed(self):
        return self.status == 'confirmed'
    
    @property
    def is_pending_payment(self):
        return self.status == 'payment_pending'
    
    @property
    def is_rejected(self):
        return self.status == 'rejected'
    
    @property
    def can_be_cancelled(self):
        return self.status in ['applied', 'payment_pending', 'confirmed'] and self.hackathon.is_registration_open
    
    @property
    def payment_overdue(self):
        if self.payment_deadline and self.status == 'payment_pending':
            return timezone.now() > self.payment_deadline
        return False
    
    def confirm_application(self):
        """Confirm the application after payment (if required) and organizer approval"""
        if self.status in ['applied', 'payment_pending']:
            self.status = 'confirmed'
            self.confirmed_at = timezone.now()
            self.save(update_fields=['status', 'confirmed_at', 'updated_at'])
            
            # Update hackathon confirmed participants count
            self.hackathon.confirmed_participants += 1
            self.hackathon.save(update_fields=['confirmed_participants'])
            
            return True
        return False
    
    def reject_application(self, reason, details=''):
        """Reject the application with reason"""
        if self.status not in ['rejected', 'cancelled']:
            self.status = 'rejected'
            self.rejection_reason = reason
            self.rejection_details = details
            self.save(update_fields=['status', 'rejection_reason', 'rejection_details', 'updated_at'])
            return True
        return False
