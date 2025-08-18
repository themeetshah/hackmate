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
        teams = Team.objects.select_related('hackathon', 'team_leader').prefetch_related('members')
        
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
            return Response({
                'success': True,
                'message': 'Team created successfully',
                'team': response_serializer.data
            }, status=status.HTTP_201_CREATED)
        
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
        Q(team_leader=user) | Q(members=user)
    ).select_related('hackathon', 'team_leader').prefetch_related('members').distinct()
    
    serializer = TeamListSerializer(teams, many=True)
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