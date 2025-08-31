from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ('participant', 'Participant/User'),
        ('organizer', 'Organizer'),
        ('admin', 'Admin'),
    ]
    
    # Basic Information
    name = models.CharField(max_length=100, blank=True)
    email = models.EmailField(unique=True)
    bio = models.TextField(max_length=500, blank=True)
    location = models.CharField(max_length=100, blank=True)
    phone_number = models.CharField(max_length=15, blank=True)
    
    # Profile Links
    github_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)
    leetcode_url = models.URLField(blank=True)
    
    # Skills and Experience (JSON fields for flexibility)
    skills = models.JSONField(default=list, blank=True)
    interests = models.JSONField(default=list, blank=True)
    experience_level = models.CharField(
        max_length=20,
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('advanced', 'Advanced'),
        ],
        default='beginner'
    )
    
    # User Role for Hackathon Platform
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='participant')
    
    # Hackathon Statistics (Updated field names for clarity)
    total_hackathons_participated = models.IntegerField(default=0)  # Renamed from total_hackathons
    total_hackathons_organized = models.IntegerField(default=0)     # New field for organizers
    hackathons_won = models.IntegerField(default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    
    # Profile Settings
    availability_status = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Use email as username
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'name']

    def __str__(self):
        return self.email
    
    # Helper methods for role management
    def is_organizer(self):
        return self.role in ['organizer', 'admin']
    
    def is_admin(self):
        return self.role == 'admin'
    
    def can_organize_hackathons(self):
        return self.role in ['organizer', 'admin']
    
    # Statistics properties
    @property
    def total_projects(self):
        """For backward compatibility with existing profile page"""
        return self.total_hackathons_participated
    
    @property
    def total_hackathons(self):
        """For backward compatibility"""
        return self.total_hackathons_participated