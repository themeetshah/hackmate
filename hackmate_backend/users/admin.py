from django.contrib import admin
from .models import Skill, UserProfile

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "category", "created_at")
    search_fields = ("name",)
    list_filter = ("category",)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "experience_level", "years_of_experience", "availability_status")
    search_fields = ("user__email", "user__username")
    list_filter = ("experience_level", "availability_status")
