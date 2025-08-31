from datetime import timedelta
from rest_framework.decorators import api_view, permission_classes 
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q
from django.core.paginator import Paginator
from .models import Team, TeamMembership, TeamInvitation, TeamMessage
from .serializers import (
    TeamListSerializer, TeamDetailSerializer, TeamCreateSerializer,
    TeamInvitationSerializer, TeamInvitationCreateSerializer,
    TeamMessageSerializer
)
from hackathons.models import HackathonApplication
from users.models import User

# Team Views
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def team_list_create(request):
    """
    GET: List all public teams
    POST: Create a new team
    """
    if request.method == 'GET':
        teams = Team.objects.select_related('hackathon', 'team_leader').prefetch_related('teammembership_set__user')
        
        # Optional filtering
        hackathon_id = request.query_params.get('hackathon')
        if hackathon_id:
            teams = teams.filter(hackathon_id=hackathon_id)
        
        status_filter = request.query_params.get('status')
        if status_filter:
            teams = teams.filter(status=status_filter)
        
        # Pagination
        page = request.query_params.get('page', 1)
        paginator = Paginator(teams, 20)
        teams_page = paginator.get_page(page)
        
        serializer = TeamListSerializer(teams_page, many=True)
        return Response({
            'success': True,
            'teams': serializer.data,
            'total_pages': paginator.num_pages,
            'current_page': int(page),
            'total_count': paginator.count
        })
    
    elif request.method == 'POST':
        serializer = TeamCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            team = serializer.save()
            response_serializer = TeamDetailSerializer(team)
            print(response_serializer.data)

            # NEW LOGIC: Decline all other pending requests for same hackathon
            user = request.user
            hackathon = team.hackathon
            
            # Find and decline any pending join requests by this user for the same hackathon
            declined_count = TeamMembership.objects.filter(
                user=user,
                team__hackathon=hackathon,
                status='pending'
            ).exclude(team=team).update(status='declined')
            
            # Also decline any pending invitations for this user for the same hackathon
            from .models import TeamInvitation
            TeamInvitation.objects.filter(
                invitee=user,
                team__hackathon=hackathon,
                status='pending'
            ).exclude(team=team).update(status='declined')
            
            print(f"Declined {declined_count} pending requests for user {user.id} in hackathon {hackathon.id}")
        
            response_serializer = TeamDetailSerializer(team)
            return Response({
                'success': True,
                'message': 'Team created successfully',
                'team': response_serializer.data
            }, status=status.HTTP_201_CREATED)
            # return Response({
            #     'success': True,
            #     'message': 'Team created successfully',
            #     'team': response_serializer.data
            # }, status=status.HTTP_201_CREATED)
        
        print(serializer.errors)
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def team_detail(request, pk):
    """
    GET: Get team details
    PUT: Update team (only leader)
    DELETE: Delete team (only leader)
    """
    try:
        team = Team.objects.select_related('hackathon', 'team_leader').prefetch_related('teammembership_set__user').get(pk=pk)
    except Team.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Team not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = TeamDetailSerializer(team)
        return Response({
            'success': True,
            'team': serializer.data
        })
    
    elif request.method == 'PUT':
        # Only team leader can update
        if team.team_leader != request.user:
            return Response({
                'success': False,
                'message': 'Only team leader can update team details'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = TeamCreateSerializer(team, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            team = serializer.save()
            response_serializer = TeamDetailSerializer(team)
            return Response({
                'success': True,
                'message': 'Team updated successfully',
                'team': response_serializer.data
            })
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # Only team leader can delete
        if team.team_leader != request.user:
            return Response({
                'success': False,
                'message': 'Only team leader can delete the team'
            }, status=status.HTTP_403_FORBIDDEN)
        
        team.delete()
        return Response({
            'success': True,
            'message': 'Team deleted successfully'
        }, status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_teams(request):
    """Get user's teams (as leader or member)"""
    user = request.user
    teams = Team.objects.filter(
        Q(team_leader=user) | Q(teammembership__user=user, teammembership__status='active')
    ).select_related('hackathon', 'team_leader').prefetch_related('teammembership_set__user').distinct()
    # for team in teams:
        # print(team.members)
    serializer = TeamListSerializer(teams, many=True)
    # print(serializer.data)
    return Response({
        'success': True,
        'teams': serializer.data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def available_hackathons(request):
    """Get hackathons user can create teams for"""
    user = request.user
    applications = HackathonApplication.objects.filter(
        user=user,
        status__in=['applied', 'confirmed', 'payment_pending']
    ).select_related('hackathon')
    
    hackathons = []
    for app in applications:
        hackathons.append({
            'id': app.hackathon.id,
            'title': app.hackathon.title,
            'start_date': app.hackathon.start_date,
            'end_date': app.hackathon.end_date,
            'status': app.hackathon.status
        })
    
    return Response({
        'success': True,
        'hackathons': hackathons
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_team_request(request, pk):
    """Request to join a team"""
    try:
        team = Team.objects.get(pk=pk)
    except Team.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Team not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    user = request.user
    
    # Check if team is full
    if team.is_full:
        return Response({
            'success': False,
            'message': 'Team is already full'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if already a member
    if TeamMembership.objects.filter(team=team, user=user, status='active').exists():
        return Response({
            'success': False,
            'message': 'You are already a member of this team'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if already has pending request
    if TeamMembership.objects.filter(team=team, user=user, status='pending').exists():
        return Response({
            'success': False,
            'message': 'You already have a pending request for this team'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Create membership request
    TeamMembership.objects.create(
        team=team,
        user=user,
        status='pending',
        invited_by=user,  # Self-request
        skills_contribution=request.data.get('skills', []),
        preferred_role_in_project=request.data.get('role', ''),
        invitation_message=request.data.get('message', '')
    )
    
    return Response({
        'success': True,
        'message': 'Join request sent successfully'
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def leave_team(request, pk):
    """Leave a team"""
    try:
        team = Team.objects.get(pk=pk)
    except Team.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Team not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    user = request.user
    
    try:
        membership = TeamMembership.objects.get(team=team, user=user, status='active')
        
        if membership.role == 'leader':
            return Response({
                'success': False,
                'message': 'Team leader cannot leave. Transfer leadership first.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        membership.status = 'left'
        membership.left_at = timezone.now()
        membership.save()
        
        # Update team status
        team.update_status()
        
        return Response({
            'success': True,
            'message': 'Successfully left the team'
        })
        
    except TeamMembership.DoesNotExist:
        return Response({
            'success': False,
            'message': 'You are not a member of this team'
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def manage_team_member(request, pk, member_id):
    """Approve/reject team member requests (only team leader)"""
    try:
        team = Team.objects.get(pk=pk)
    except Team.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Team not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Only team leader can manage members
    if team.team_leader != request.user:
        return Response({
            'success': False,
            'message': 'Only team leader can manage team members'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        membership = TeamMembership.objects.get(team=team, user_id=member_id, status='pending')
    except TeamMembership.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Pending membership not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    action = request.data.get('action')  # 'approve' or 'reject'
    
    if action == 'approve':
        if team.is_full:
            return Response({
                'success': False,
                'message': 'Team is already full'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        membership.status = 'active'
        membership.joined_at = timezone.now()
        membership.save()
        
        # Update team status
        team.update_status()

        approved_user = membership.user  # ← This is the key fix!
        hackathon = team.hackathon
        
        # Find and decline any other pending join requests by the APPROVED USER for the same hackathon
        declined_memberships = TeamMembership.objects.filter(
            user=approved_user,  # ← Fixed: use approved_user instead of request.user
            team__hackathon=hackathon,
            status='pending'
        ).exclude(team=team).update(status='declined')
        
        # Also decline any pending invitations for the APPROVED USER for the same hackathon
        from .models import TeamInvitation
        declined_invitations = TeamInvitation.objects.filter(
            invitee=approved_user,  # ← Fixed: use approved_user instead of request.user
            team__hackathon=hackathon,
            status='pending'
        ).exclude(team=team).update(status='declined')
        
        print(f"Approved user {approved_user.id} to team {team.id}")
        print(f"Declined {declined_memberships} pending memberships and {declined_invitations} pending invitations for user {approved_user.id} in hackathon {hackathon.id}")
        
        return Response({
            'success': True,
            'message': 'Member approved successfully'
        })
    
    elif action == 'reject':
        membership.status = 'declined'
        membership.save()
        
        return Response({
            'success': True,
            'message': 'Member request rejected'
        })
    
    else:
        return Response({
            'success': False,
            'message': 'Invalid action. Use "approve" or "reject"'
        }, status=status.HTTP_400_BAD_REQUEST)

# Team Invitation Views
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def team_invitations(request):
    """
    GET: List user's invitations (sent/received)
    POST: Create new invitation
    """
    user = request.user
    
    if request.method == 'GET':
        invitation_type = request.query_params.get('type', 'received')  # 'sent', 'received', or 'all'
        
        queryset = TeamInvitation.objects.select_related('team', 'inviter', 'invitee')
        
        if invitation_type == 'sent':
            queryset = queryset.filter(inviter=user)
        elif invitation_type == 'received':
            queryset = queryset.filter(invitee=user, status='pending')
        else:  # all
            queryset = queryset.filter(Q(inviter=user) | Q(invitee=user))
        
        serializer = TeamInvitationSerializer(queryset, many=True)
        return Response({
            'success': True,
            'invitations': serializer.data
        })
    
    elif request.method == 'POST':
        serializer = TeamInvitationCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            invitation = serializer.save()
            response_serializer = TeamInvitationSerializer(invitation)
            return Response({
                'success': True,
                'message': 'Invitation sent successfully',
                'invitation': response_serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_invitation(request, pk):
    """Accept team invitation"""
    try:
        invitation = TeamInvitation.objects.get(pk=pk, invitee=request.user, status='pending')
    except TeamInvitation.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Invitation not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Check if team is still not full
    if invitation.team.is_full:
        invitation.status = 'expired'
        invitation.save()
        return Response({
            'success': False,
            'message': 'Team is now full'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Create team membership
    TeamMembership.objects.create(
        team=invitation.team,
        user=request.user,
        status='active',
        joined_at=timezone.now(),
        invited_by=invitation.inviter
    )
    
    # Update invitation status
    invitation.status = 'accepted'
    invitation.responded_at = timezone.now()
    invitation.save()
    
    # Update team status
    invitation.team.update_status()
    
    return Response({
        'success': True,
        'message': 'Invitation accepted successfully'
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def decline_invitation(request, pk):
    """Decline team invitation"""
    try:
        invitation = TeamInvitation.objects.get(pk=pk, invitee=request.user, status='pending')
    except TeamInvitation.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Invitation not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    invitation.status = 'declined'
    invitation.responded_at = timezone.now()
    invitation.save()
    
    return Response({
        'success': True,
        'message': 'Invitation declined'
    })

# Team Message Views
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def team_messages(request, team_id):
    """
    GET: List team messages
    POST: Send new message
    """
    try:
        team = Team.objects.get(pk=team_id)
    except Team.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Team not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Verify user is a team member
    if not TeamMembership.objects.filter(team=team, user=request.user, status='active').exists():
        return Response({
            'success': False,
            'message': 'You are not a member of this team'
        }, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        messages = TeamMessage.objects.filter(team=team).select_related('sender').order_by('created_at')
        
        # Pagination
        page = request.query_params.get('page', 1)
        paginator = Paginator(messages, 50)
        messages_page = paginator.get_page(page)
        
        serializer = TeamMessageSerializer(messages_page, many=True)
        return Response({
            'success': True,
            'messages': serializer.data,
            'total_pages': paginator.num_pages,
            'current_page': int(page)
        })
    
    elif request.method == 'POST':
        serializer = TeamMessageSerializer(data=request.data, context={'request': request, 'team': team})
        if serializer.is_valid():
            message = serializer.save(team=team)
            response_serializer = TeamMessageSerializer(message)
            return Response({
                'success': True,
                'message': response_serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def team_message_detail(request, team_id, message_id):
    """
    PUT: Edit message (only sender)
    DELETE: Delete message (only sender or team leader)
    """
    try:
        team = Team.objects.get(pk=team_id)
        message = TeamMessage.objects.get(pk=message_id, team=team)
    except (Team.DoesNotExist, TeamMessage.DoesNotExist):
        return Response({
            'success': False,
            'message': 'Message not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Verify user is a team member
    if not TeamMembership.objects.filter(team=team, user=request.user, status='active').exists():
        return Response({
            'success': False,
            'message': 'You are not a member of this team'
        }, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'PUT':
        # Only message sender can edit
        if message.sender != request.user:
            return Response({
                'success': False,
                'message': 'You can only edit your own messages'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = TeamMessageSerializer(message, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            message = serializer.save(is_edited=True, edited_at=timezone.now())
            response_serializer = TeamMessageSerializer(message)
            return Response({
                'success': True,
                'message': response_serializer.data
            })
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # Only message sender or team leader can delete
        if message.sender != request.user and team.team_leader != request.user:
            return Response({
                'success': False,
                'message': 'You can only delete your own messages or team leader can delete any message'
            }, status=status.HTTP_403_FORBIDDEN)
        
        message.delete()
        return Response({
            'success': True,
            'message': 'Message deleted successfully'
        }, status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def invite_to_team(request, pk):
    """Invite a user to join a team"""
    try:
        team = Team.objects.get(pk=pk)
    except Team.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Team not found'
        }, status=status.HTTP_404_NOT_FOUND)

    # Only team leader can invite
    if team.team_leader != request.user:
        return Response({
            'success': False,
            'message': 'Only team leader can invite members'
        }, status=status.HTTP_403_FORBIDDEN)

    # Check if team is full
    if team.is_full:
        return Response({
            'success': False,
            'message': 'Team is already full'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    print('Requested data: ',request.data)

    invitee_email = request.data.get('invitee_email')
    message = request.data.get('message', '')

    if not invitee_email:
        return Response({
            'success': False,
            'message': 'Invitee email is required'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Get invitee user
    try:
        invitee = User.objects.get(email=invitee_email)
    except User.DoesNotExist:
        return Response({
            'success': False,
            'message': 'User with this email does not exist'
        }, status=status.HTTP_404_NOT_FOUND)

    # Check if user is already a member
    if TeamMembership.objects.filter(team=team, user=invitee, status='active').exists():
        return Response({
            'success': False,
            'message': 'User is already a member of this team'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Check if invitation already exists
    if TeamInvitation.objects.filter(team=team, invitee=invitee, status='pending').exists():
        return Response({
            'success': False,
            'message': 'Invitation already sent to this user'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Create invitation
    invitation = TeamInvitation.objects.create(
        team=team,
        inviter=request.user,
        invitee=invitee,
        message=message,
        expires_at=timezone.now() + timedelta(days=2)
    )

    return Response({
        'success': True,
        'message': 'Invitation sent successfully'
    }, status=status.HTTP_201_CREATED)

from django.db import transaction
from datetime import timedelta
from django.contrib.auth import get_user_model

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_invitation_requests(request, pk):
    """Get ALL invitation requests for team leader"""
    try:
        team = Team.objects.get(pk=pk)
    except Team.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Team not found'
        }, status=status.HTTP_404_NOT_FOUND)

    # Only team leader can view
    if team.team_leader != request.user:
        return Response({
            'success': False,
            'message': 'Only team leader can view invitation requests'
        }, status=status.HTTP_403_FORBIDDEN)

    # ✅ Get ALL invitation requests for this team (all statuses)
    invitation_requests = TeamInvitation.objects.filter(
        team=team
    ).select_related('inviter', 'invitee').order_by('-created_at')

    serializer = TeamInvitationSerializer(invitation_requests, many=True)
    return Response({
        'success': True,
        'invitation_requests': serializer.data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_pending_requests(request, pk):
    """Get ALL join requests for a team"""
    try:
        team = Team.objects.get(pk=pk)
    except Team.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Team not found'
        }, status=status.HTTP_404_NOT_FOUND)

    # Only team leader can view
    if team.team_leader != request.user:
        return Response({
            'success': False,
            'message': 'Only team leader can view requests'
        }, status=status.HTTP_403_FORBIDDEN)

    # ✅ Get ALL join requests for this team (all statuses)
    all_requests = TeamMembership.objects.filter(
        team=team
    ).select_related('user').order_by('-invited_at')

    requests_data = []
    for membership in all_requests:
        requests_data.append({
            'id': membership.id,
            'user': {
                'id': membership.user.id,
                'name': membership.user.name,
                'email': membership.user.email,
                'average_rating': membership.user.average_rating
            },
            'skills_contribution': membership.skills_contribution,
            'preferred_role_in_project': membership.preferred_role_in_project,
            'invitation_message': membership.invitation_message,
            'invited_at': membership.invited_at,
            'joined_at': membership.joined_at,
            'left_at': membership.left_at,
            'status': membership.status,
            'role': membership.role
        })

    return Response({
        'success': True,
        'requests': requests_data
    })

# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_all_user_requests(request):
#     """Get ALL user's requests and invitations with complete history"""
#     user = request.user
    
#     # ✅ Get ALL join requests sent by user (all statuses)
#     join_requests = TeamMembership.objects.filter(
#         user=user,
#         invited_by=user  # Self-requested
#     ).select_related('team__hackathon').order_by('-invited_at')
    
#     # ✅ Get ALL invitations received by user (all statuses)
#     invitations_received = TeamInvitation.objects.filter(
#         invitee=user
#     ).select_related('team__hackathon', 'inviter').order_by('-created_at')
    
#     # ✅ Get ALL invitation requests sent by user (all statuses)
#     invitation_requests_sent = TeamInvitation.objects.filter(
#         inviter=user
#     ).select_related('team__hackathon', 'invitee').order_by('-created_at')

#     data = {
#         'join_requests': [],
#         'invitations_received': [],
#         'invitation_requests_sent': []
#     }

#     # Serialize ALL join requests with complete data
#     for request in join_requests:
#         data['join_requests'].append({
#             'id': request.id,
#             'team': {
#                 'id': request.team.id,
#                 'name': request.team.name,
#                 'hackathon_title': request.team.hackathon.title
#             },
#             'status': request.status,
#             'role': request.role,
#             'skills_contribution': request.skills_contribution,
#             'preferred_role_in_project': request.preferred_role_in_project,
#             'invitation_message': request.invitation_message,
#             'created_at': request.invited_at,
#             'joined_at': request.joined_at,
#             'left_at': request.left_at
#         })

#     # Serialize ALL invitations received with complete data
#     for invitation in invitations_received:
#         data['invitations_received'].append({
#             'id': invitation.id,
#             'team': {
#                 'id': invitation.team.id,
#                 'name': invitation.team.name,
#                 'hackathon_title': invitation.team.hackathon.title
#             },
#             'inviter': invitation.inviter.name,
#             'message': invitation.message,
#             'status': invitation.status,
#             'created_at': invitation.created_at,
#             'responded_at': invitation.responded_at,
#             'expires_at': invitation.expires_at
#         })

#     # Serialize ALL invitation requests sent with complete data
#     for request in invitation_requests_sent:
#         data['invitation_requests_sent'].append({
#             'id': request.id,
#             'team': {
#                 'id': request.team.id,
#                 'name': request.team.name,
#                 'hackathon_title': request.team.hackathon.title
#             },
#             'invitee': request.invitee.name,
#             'invitee_email': request.invitee.email,
#             'message': request.message,
#             'status': request.status,
#             'created_at': request.created_at,
#             'responded_at': request.responded_at,
#             'expires_at': request.expires_at
#         })

#     return Response({
#         'success': True,
#         'data': data
#     })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_user_requests(request):
    """Get ALL user's requests and invitations with complete history"""
    user = request.user
    print(f"DEBUG: Getting requests for user {user.id} ({user.email})")
    
    # ✅ Get ALL join requests sent by user (all statuses)
    join_requests = TeamMembership.objects.filter(
        user=user,
        invited_by=user  # Self-requested
    ).select_related('team__hackathon').order_by('-invited_at')
    print(f"DEBUG: Found {join_requests.count()} join requests")
    
    # ✅ Get ALL invitations received by user (all statuses)
    invitations_received = TeamInvitation.objects.filter(
        invitee=user
    ).select_related('team__hackathon', 'inviter').order_by('-created_at')
    print(f"DEBUG: Found {invitations_received.count()} invitations received")
    
    # ✅ Get ALL invitation requests sent by user (all statuses)
    invitation_requests_sent = TeamInvitation.objects.filter(
        inviter=user
    ).select_related('team__hackathon', 'invitee').order_by('-created_at')
    print(f"DEBUG: Found {invitation_requests_sent.count()} invitation requests sent")

    # Also check for ANY team memberships for this user
    all_memberships = TeamMembership.objects.filter(user=user)
    print(f"DEBUG: User has {all_memberships.count()} total memberships")
    for membership in all_memberships:
        print(f"  - Team: {membership.team.name}, Status: {membership.status}, Invited by: {membership.invited_by}")

    # Check for ANY team invitations involving this user
    all_invitations = TeamInvitation.objects.filter(Q(invitee=user) | Q(inviter=user))
    print(f"DEBUG: User has {all_invitations.count()} total invitations")
    for invitation in all_invitations:
        print(f"  - Team: {invitation.team.name}, Status: {invitation.status}, Inviter: {invitation.inviter}, Invitee: {invitation.invitee}")

    data = {
        'join_requests': [],
        'invitations_received': [],
        'invitation_requests_sent': []
    }

    # Serialize ALL join requests with complete data
    for request in join_requests:
        data['join_requests'].append({
            'id': request.id,
            'team': {
                'id': request.team.id,
                'name': request.team.name,
                'hackathon_title': request.team.hackathon.title
            },
            'status': request.status,
            'role': request.role,
            'skills_contribution': request.skills_contribution,
            'preferred_role_in_project': request.preferred_role_in_project,
            'invitation_message': request.invitation_message,
            'created_at': request.invited_at,
            'joined_at': request.joined_at,
            'left_at': request.left_at
        })

    # Serialize ALL invitations received with complete data
    for invitation in invitations_received:
        data['invitations_received'].append({
            'id': invitation.id,
            'team': {
                'id': invitation.team.id,
                'name': invitation.team.name,
                'hackathon_title': invitation.team.hackathon.title
            },
            'inviter': invitation.inviter.name,
            'message': invitation.message,
            'status': invitation.status,
            'created_at': invitation.created_at,
            'responded_at': invitation.responded_at,
            'expires_at': invitation.expires_at
        })

    # Serialize ALL invitation requests sent with complete data
    for request in invitation_requests_sent:
        data['invitation_requests_sent'].append({
            'id': request.id,
            'team': {
                'id': request.team.id,
                'name': request.team.name,
                'hackathon_title': request.team.hackathon.title
            },
            'invitee': request.invitee.name,
            'invitee_email': request.invitee.email,
            'message': request.message,
            'status': request.status,
            'created_at': request.created_at,
            'responded_at': request.responded_at,
            'expires_at': request.expires_at
        })

    print(f"DEBUG: Final data counts - join_requests: {len(data['join_requests'])}, invitations_received: {len(data['invitations_received'])}, invitation_requests_sent: {len(data['invitation_requests_sent'])}")

    return Response({
        'success': True,
        'data': data
    })


# ✅ NEW: Get ALL team-related requests for leaders
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_team_requests(request, pk):
    """Get ALL requests and invitations for a specific team (for team leaders)"""
    try:
        team = Team.objects.get(pk=pk)
    except Team.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Team not found'
        }, status=status.HTTP_404_NOT_FOUND)

    # Only team leader can view
    if team.team_leader != request.user:
        return Response({
            'success': False,
            'message': 'Only team leader can view team requests'
        }, status=status.HTTP_403_FORBIDDEN)

    # Get ALL join requests for this team
    join_requests = TeamMembership.objects.filter(
        team=team
    ).select_related('user').order_by('-invited_at')

    # Get ALL invitation requests for this team
    invitation_requests = TeamInvitation.objects.filter(
        team=team
    ).select_related('inviter', 'invitee').order_by('-created_at')

    # Serialize join requests
    join_requests_data = []
    for membership in join_requests:
        join_requests_data.append({
            'id': membership.id,
            'user': {
                'id': membership.user.id,
                'name': membership.user.name,
                'email': membership.user.email,
                'average_rating': membership.user.average_rating
            },
            'skills_contribution': membership.skills_contribution,
            'preferred_role_in_project': membership.preferred_role_in_project,
            'invitation_message': membership.invitation_message,
            'invited_at': membership.invited_at,
            'joined_at': membership.joined_at,
            'left_at': membership.left_at,
            'status': membership.status,
            'role': membership.role,
            'type': 'join_request'
        })

    # Serialize invitation requests
    invitation_requests_data = []
    for invitation in invitation_requests:
        invitation_requests_data.append({
            'id': invitation.id,
            'inviter': {
                'id': invitation.inviter.id,
                'name': invitation.inviter.name,
                'email': invitation.inviter.email
            },
            'invitee': {
                'id': invitation.invitee.id,
                'name': invitation.invitee.name,
                'email': invitation.invitee.email
            },
            'message': invitation.message,
            'status': invitation.status,
            'created_at': invitation.created_at,
            'responded_at': invitation.responded_at,
            'expires_at': invitation.expires_at,
            'type': 'invitation_request'
        })

    return Response({
        'success': True,
        'data': {
            'join_requests': join_requests_data,
            'invitation_requests': invitation_requests_data
        }
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_requests(request):
    """Get user's join requests"""
    user = request.user
    
    # Get user's pending join requests
    my_requests = TeamMembership.objects.filter(
        user=user, 
        status='pending',
        invited_by=user  # Self-requested
    ).select_related('team')

    requests_data = []
    for membership in my_requests:
        requests_data.append({
            'id': membership.id,
            'team': {
                'id': membership.team.id,
                'name': membership.team.name,
                'hackathon_title': membership.team.hackathon.title
            },
            'invited_at': membership.invited_at,
            'status': membership.status
        })

    return Response({
        'success': True,
        'requests': requests_data
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def invite_to_team(request, pk):
    """Create invitation request - anyone can invite, but leader must approve"""
    try:
        team = Team.objects.get(pk=pk)
    except Team.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Team not found'
        }, status=status.HTTP_404_NOT_FOUND)

    invitee_email = request.data.get('invitee_email')
    message = request.data.get('message', '')

    if not invitee_email:
        return Response({
            'success': False,
            'message': 'Invitee email is required'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Get invitee user
    try:
        invitee = get_user_model().objects.get(email=invitee_email)
    except get_user_model().DoesNotExist:
        return Response({
            'success': False,
            'message': 'User with this email does not exist'
        }, status=status.HTTP_404_NOT_FOUND)

    # Check if user is already a member
    if TeamMembership.objects.filter(team=team, user=invitee, status='active').exists():
        return Response({
            'success': False,
            'message': 'User is already a member of this team'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Check if invitation already exists
    if TeamInvitation.objects.filter(
        team=team, 
        invitee=invitee, 
        status__in=['pending', 'leader_pending']
    ).exists():
        return Response({
            'success': False,
            'message': 'Invitation already sent to this user'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Create invitation with leader_pending status
    invitation = TeamInvitation.objects.create(
        team=team,
        inviter=request.user,
        invitee=invitee,
        message=message,
        status='leader_pending',  # Requires leader approval first
        expires_at=timezone.now() + timedelta(days=7)
    )

    return Response({
        'success': True,
        'message': 'Invitation request sent to team leader for approval'
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_invitation_request(request, pk):
    """Team leader approves/rejects invitation requests"""
    try:
        invitation = TeamInvitation.objects.get(pk=pk)
    except TeamInvitation.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Invitation not found'
        }, status=status.HTTP_404_NOT_FOUND)

    # Only team leader can approve
    if invitation.team.team_leader != request.user:
        return Response({
            'success': False,
            'message': 'Only team leader can approve invitations'
        }, status=status.HTTP_403_FORBIDDEN)

    action = request.data.get('action')  # 'approve' or 'reject'

    if action == 'approve':
        invitation.status = 'pending'  # Now sends to invitee
        invitation.save()
        return Response({
            'success': True,
            'message': 'Invitation approved and sent to user'
        })
    elif action == 'reject':
        invitation.status = 'rejected'
        invitation.save()
        return Response({
            'success': True,
            'message': 'Invitation request rejected'
        })
    else:
        return Response({
            'success': False,
            'message': 'Invalid action'
        }, status=status.HTTP_400_BAD_REQUEST)

