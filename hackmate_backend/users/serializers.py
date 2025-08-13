from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Skill, UserProfile

User = get_user_model()

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ("id", "name", "category")


class UserProfileSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_username = serializers.CharField(source="user.username", read_only=True)
    skills = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(), many=True, required=False
    )

    class Meta:
        model = UserProfile
        fields = (
            "user_email", "user_username",
            "bio", "profile_picture", "address", "phone_number",
            "timezone", "linkedin_url", "github_url", "leetcode_url", "portfolio_url",
            "skills", "experience_level", "years_of_experience",
            "interests", "preferred_team_size", "availability_status",
            "average_rating", "total_hackathons", "hackathons_won",
            "created_at", "updated_at"
        )
        read_only_fields = ("average_rating", "total_hackathons", "hackathons_won", "created_at", "updated_at")
