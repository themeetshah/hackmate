from rest_framework import serializers
from .models import Hackathon, FavoriteHackathon

class HackathonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hackathon
        fields = "__all__"
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if not self.context.get("is_organiser"):
            # Hide internal fields from public
            data.pop("created_by", None)
            data.pop("is_user_created", None)
            # You could hide is_published or other internal info too
        return data

class FavoriteHackathonSerializer(serializers.ModelSerializer):
    class Meta:
        model = FavoriteHackathon
        fields = "__all__"

class HackathonCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hackathon
        exclude = ("created_by", "is_user_created", "participants", "created_at", "updated_at")