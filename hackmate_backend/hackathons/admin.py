
from django.contrib import admin
from .models import Hackathon, FavoriteHackathon

@admin.register(Hackathon)
class HackathonAdmin(admin.ModelAdmin):
	list_display = ("title", "platform", "start_date", "end_date", "location", "prize_pool", "registration_deadline")
	search_fields = ("title", "description", "themes", "tags", "sponsors")
	list_filter = ("platform", "is_virtual", "location")

@admin.register(FavoriteHackathon)
class FavoriteHackathonAdmin(admin.ModelAdmin):
	list_display = ("user", "hackathon", "created_at")
