from django.urls import path
from .views import SkillListView, MyProfileView

urlpatterns = [
    path("skills/", SkillListView.as_view(), name="skills-list"),
    path("profile/me/", MyProfileView.as_view(), name="my-profile"),
]