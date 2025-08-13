# hackathon_applications/admin.py

from django.contrib import admin
from .models import HackathonApplication, ApplicationForm, ApplicationResponse


@admin.register(HackathonApplication)
class HackathonApplicationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "hackathon",
        "preferred_role",
        "status",
        "submitted_at",
        "created_at",
    )
    list_filter = ("status", "preferred_role", "previous_hackathon_experience")
    search_fields = ("user__email", "hackathon__title")
    readonly_fields = ("created_at", "updated_at", "submitted_at", "reviewed_at")
    raw_id_fields = ("user", "hackathon", "reviewed_by")


@admin.register(ApplicationForm)
class ApplicationFormAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "hackathon",
        "requires_portfolio",
        "requires_resume",
        "requires_github",
        "requires_linkedin",
        "is_active",
    )
    list_filter = ("is_active", "requires_portfolio", "requires_resume")
    search_fields = ("hackathon__title",)


@admin.register(ApplicationResponse)
class ApplicationResponseAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "application",
        "created_at",
    )
    search_fields = ("application__user__email", "application__hackathon__title")
    readonly_fields = ("created_at", "updated_at")
