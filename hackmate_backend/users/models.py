from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Skill(models.Model):
    SKILL_CATEGORIES = [
        ("frontend", "Frontend Development"),
        ("backend", "Backend Development"),
        ("mobile", "Mobile Development"),
        ("ml_ai", "Machine Learning/AI"),
        ("design", "UI/UX Design"),
        ("devops", "DevOps/Cloud"),
        ("data", "Data Science"),
        ("blockchain", "Blockchain"),
        ("game_dev", "Game Development"),
        ("cybersecurity", "Cybersecurity"),
    ]

    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=20, choices=SKILL_CATEGORIES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class UserProfile(models.Model):
    EXPERIENCE_LEVELS = [
        ("beginner", "Beginner"),
        ("intermediate", "Intermediate"),
        ("advanced", "Advanced"),
        ("expert", "Expert"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    bio = models.TextField(max_length=500, blank=True)
    profile_picture = models.ImageField(upload_to="profile_pics/", blank=True, null=True)

    address = models.CharField(max_length=255, blank=True)
    phone_number = models.CharField(max_length=15, blank=True)
    timezone = models.CharField(max_length=50, default="UTC")

    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    leetcode_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)

    skills = models.ManyToManyField(Skill, blank=True)
    experience_level = models.CharField(max_length=20, choices=EXPERIENCE_LEVELS, default="beginner")
    years_of_experience = models.PositiveIntegerField(default=0)

    interests = models.TextField(blank=True, help_text="Comma-separated interests")
    preferred_team_size = models.PositiveIntegerField(default=4)
    availability_status = models.BooleanField(default=True)

    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_hackathons = models.PositiveIntegerField(default=0)
    hackathons_won = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} Profile"
