from rest_framework import generics, permissions
from django.db.models import Q
from .models import Skill, UserProfile
from .serializers import SkillSerializer, UserProfileSerializer

class SkillListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = SkillSerializer

    def get_queryset(self):
        queryset = Skill.objects.all()
        query = self.request.query_params.get("q")
        if query:
            queryset = queryset.filter(Q(name__icontains=query) | Q(category__icontains=query))
        return queryset


class MyProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user.profile
