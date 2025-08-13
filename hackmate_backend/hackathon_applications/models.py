from django.contrib.auth import get_user_model
from django.db import models
from hackathons.models import Hackathon

User = get_user_model()

class HackathonApplication(models.Model):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("submitted", "Submitted"),
        ("under_review", "Under Review"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
        ("waitlisted", "Waitlisted"),
    ]

    ROLE_CHOICES = [
        ("developer", "Developer"),
        ("designer", "Designer"),
        ("pm", "Product Manager"),
        ("marketing", "Marketing"),
        ("data_scientist", "Data Scientist"),
        ("other", "Other"),
    ]

    EXPERIENCE_CHOICES = [
        ("first_time", "First Time"),
        ("1-2", "1-2 Hackathons"),
        ("3-5", "3-5 Hackathons"),
        ("5+", "5+ Hackathons"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="hackathon_applications")
    hackathon = models.ForeignKey(Hackathon, on_delete=models.CASCADE, related_name="applications")

    preferred_role = models.CharField(max_length=30, choices=ROLE_CHOICES)
    
    motivation = models.TextField(help_text="Why do you want to join?")
    goals = models.TextField(help_text="What do you hope to achieve?")
    preferred_team_size = models.PositiveIntegerField(default=4)
    previous_hackathon_experience = models.CharField(max_length=15, choices=EXPERIENCE_CHOICES)
    

    portfolio_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="reviewed_applications")
    reviewer_notes = models.TextField(blank=True)

    class Meta:
        unique_together = ("user", "hackathon")  # One application per hackathon per user
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email} → {self.hackathon.title} [{self.status}]"


class ApplicationForm(models.Model):
    """Template/questions for a hackathon's application"""
    hackathon = models.OneToOneField(Hackathon, on_delete=models.CASCADE, related_name="custom_form")

    requires_portfolio = models.BooleanField(default=False)
    requires_resume = models.BooleanField(default=False)
    requires_github = models.BooleanField(default=False)
    requires_linkedin = models.BooleanField(default=False)

    custom_question_1 = models.TextField(blank=True)
    custom_question_2 = models.TextField(blank=True)
    custom_question_3 = models.TextField(blank=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Form for {self.hackathon.title}"


class ApplicationResponse(models.Model):
    """Answers to the ApplicationForm"""
    application = models.OneToOneField(HackathonApplication, on_delete=models.CASCADE, related_name="custom_responses")

    custom_answer_1 = models.TextField(blank=True)
    custom_answer_2 = models.TextField(blank=True)
    custom_answer_3 = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Responses for {self.application.user.email} in {self.application.hackathon.title}"
