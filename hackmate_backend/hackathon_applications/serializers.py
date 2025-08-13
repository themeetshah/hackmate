from rest_framework import serializers
from .models import HackathonApplication, ApplicationForm, ApplicationResponse
from hackathons.models import Hackathon


### ---- ApplicationForm ---- ###
class ApplicationFormSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationForm
        fields = "__all__"
        read_only_fields = ["hackathon", "created_at", "updated_at"]


### ---- ApplicationResponse ---- ###
class ApplicationResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationResponse
        fields = "__all__"
        read_only_fields = ["application", "created_at", "updated_at"]


### ---- HackathonApplication ---- ###
class HackathonApplicationCreateSerializer(serializers.ModelSerializer):
    """For creating a new application"""
    
    class Meta:
        model = HackathonApplication
        exclude = ("status", "submitted_at", "reviewed_at", "reviewed_by", "reviewer_notes",
                   "created_at", "updated_at")
        read_only_fields = ("user", "hackathon")  # We'll set these in create()

    def validate(self, data):
        # Ensure hackathon is open for applications
        hackathon = self.context.get("hackathon")
        if not hackathon or not hackathon.is_user_created or not hackathon.is_published:
            raise serializers.ValidationError("Applications are not open for this hackathon.")
        
        # Ensure one application per user per hackathon
        user = self.context["request"].user
        if HackathonApplication.objects.filter(user=user, hackathon=hackathon).exists():
            raise serializers.ValidationError("You have already applied to this hackathon.")
        
        return data

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        validated_data["hackathon"] = self.context.get("hackathon")
        validated_data["status"] = "submitted"
        from django.utils import timezone
        validated_data["submitted_at"] = timezone.now()
        return super().create(validated_data)


class HackathonApplicationListSerializer(serializers.ModelSerializer):
    hackathon_title = serializers.CharField(source="hackathon.title", read_only=True)

    class Meta:
        model = HackathonApplication
        fields = ("id", "hackathon", "hackathon_title", "preferred_role", "status", "submitted_at")

class HackathonApplicationDetailSerializer(serializers.ModelSerializer):
    hackathon_title = serializers.CharField(source="hackathon.title", read_only=True)
    responses = serializers.SerializerMethodField()

    class Meta:
        model = HackathonApplication
        fields = "__all__"  # All application fields + hackathon_title + responses

    def get_responses(self, obj):
        try:
            response = ApplicationResponse.objects.get(application=obj)
            return {
                "custom_answer_1": response.custom_answer_1,
                "custom_answer_2": response.custom_answer_2,
                "custom_answer_3": response.custom_answer_3
            }
        except ApplicationResponse.DoesNotExist:
            return None

class HackathonApplicationStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = HackathonApplication
        fields = ["status", "reviewer_notes"]  # Only these can be updated by organiser
    