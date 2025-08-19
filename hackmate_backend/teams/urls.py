from django.urls import path
from . import views

urlpatterns = [
    # Team URLs
    path('', views.team_list_create, name='team-list-create'),
    path('<uuid:pk>/', views.team_detail, name='team-detail'),
    path('my/', views.my_teams, name='my-teams'),
    path('available-hackathons/', views.available_hackathons, name='available-hackathons'),

    path('<uuid:pk>/join/', views.join_team_request, name='join-team'),
    path('<uuid:pk>/leave/', views.leave_team, name='leave-team'),
    path('<uuid:pk>/members/<int:member_id>/', views.manage_team_member, name='manage-team-member'),
    
    # Invitation URLs
    path('<uuid:pk>/invite/', views.invite_to_team, name='invite-to-team'),  # Add this
    path('team-invitations/', views.team_invitations, name='team-invitations'),
    path('team-invitations/<uuid:pk>/accept/', views.accept_invitation, name='accept-invitation'),
    path('team-invitations/<uuid:pk>/decline/', views.decline_invitation, name='decline-invitation'),
    path('invitation-requests/<uuid:pk>/approve/', views.approve_invitation_request, name='approve-invitation-request'),

    # New URLs for pending requests
    path('<uuid:pk>/pending-requests/', views.get_pending_requests, name='team-pending-requests'),
    path('<uuid:pk>/invitation-requests/', views.get_invitation_requests, name='get-invitation-requests'),
    path('<uuid:pk>/all-requests/', views.get_all_team_requests, name='get-all-team-requests'), 
    path('my-requests/', views.get_my_requests, name='my-team-requests'),
    path('all-requests/', views.get_all_user_requests, name='get-all-user-requests'),
    
    # Message URLs
    path('<uuid:team_id>/messages/', views.team_messages, name='team-messages'),
    path('<uuid:team_id>/messages/<uuid:message_id>/', views.team_message_detail, name='team-message-detail'),

]
