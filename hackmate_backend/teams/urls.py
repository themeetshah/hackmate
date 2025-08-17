from django.urls import path
from .views import (
    # Team views
    team_list_create, team_detail, my_teams, available_hackathons,
    join_team_request, leave_team, manage_team_member,
    
    # Invitation views
    team_invitations, accept_invitation, decline_invitation,
    
    # Message views
    team_messages, team_message_detail
)

urlpatterns = [
    # Team URLs
    path('', team_list_create, name='team-list-create'),
    path('<uuid:pk>/', team_detail, name='team-detail'),
    path('my/', my_teams, name='my-teams'),
    path('available-hackathons/', available_hackathons, name='available-hackathons'),
    path('<uuid:pk>/join/', join_team_request, name='join-team'),
    path('<uuid:pk>/leave/', leave_team, name='leave-team'),
    path('<uuid:pk>/members/<int:member_id>/', manage_team_member, name='manage-team-member'),
    
    # Invitation URLs
    path('team-invitations/', team_invitations, name='team-invitations'),
    path('team-invitations/<uuid:pk>/accept/', accept_invitation, name='accept-invitation'),
    path('team-invitations/<uuid:pk>/decline/', decline_invitation, name='decline-invitation'),
    
    # Message URLs
    path('<uuid:team_id>/messages/', team_messages, name='team-messages'),
    path('<uuid:team_id>/messages/<uuid:message_id>/', team_message_detail, name='team-message-detail'),
]
