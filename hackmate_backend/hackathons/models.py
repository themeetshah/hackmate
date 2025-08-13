# hackathons/models.py
from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()

class Hackathon(models.Model):
    PLATFORM_CHOICES = [
        ("mlh", "MLH"),
        ("devfolio", "Devfolio"),
        ("hackmate", "HackMate"),  # Add this for user-created hackathons
        ("other", "Other"),
    ]
    
    # Existing fields...
    title = models.CharField(max_length=255)
    description = models.TextField()
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    location = models.CharField(max_length=255)
    is_virtual = models.BooleanField(default=True)
    prize_pool = models.CharField(max_length=100, blank=True)
    themes = models.CharField(max_length=255, blank=True)
    sponsors = models.CharField(max_length=255, blank=True)
    registration_deadline = models.DateTimeField()
    requirements = models.TextField(blank=True)
    tags = models.CharField(max_length=255, blank=True)
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES, default="other")
    url = models.URLField(blank=True)
    max_team_size = models.PositiveIntegerField(default=1)
    participants = models.PositiveIntegerField(default=0)
    image = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # New fields for user-created hackathons
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name="created_hackathons")
    is_user_created = models.BooleanField(default=False)  # True for hackathons created by users
    is_published = models.BooleanField(default=False)  # Allow draft/published status
    
    def __str__(self):
        return self.title

class FavoriteHackathon(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="favorite_hackathons")
    hackathon = models.ForeignKey(Hackathon, on_delete=models.CASCADE, related_name="favorited_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "hackathon")
