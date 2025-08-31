from django.contrib import admin
from .models import Team, TeamInvitation, TeamMembership, TeamMessage
# Register your models here.

admin.site.register(Team)
admin.site.register(TeamInvitation)
admin.site.register(TeamMembership)
admin.site.register(TeamMessage)