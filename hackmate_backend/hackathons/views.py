from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Hackathon, HackathonApplication
from .serializers import HackathonSerializer, HackathonCreateSerializer, HackathonApplicationCreateSerializer, HackathonApplicationSerializer, HackathonApplicationUpdateSerializer
from django.utils import timezone
from threading import Thread

def update_hackathon_status(hackathon_id):
    try:
        # Use a new database connection for the thread to prevent issues
        # with connection.cursor():
        hackathon = Hackathon.objects.get(id=hackathon_id)
        hackathon.update_status_based_on_dates()
    except Exception as e:
        # Log the exception for debugging
        print(f"Error updating hackathon {hackathon_id}: {e}")

@api_view(['GET', 'POST'])
def hackathon_list_view(request):
    if request.method == 'GET':
        hackathons = Hackathon.objects.filter(approval_status='approved')
        
        threads = []
        for hackathon in hackathons:
            # Create a new thread for each hackathon update
            thread = Thread(target=update_hackathon_status, args=(hackathon.id,))
            threads.append(thread)
            thread.start() # Start the thread
        
        # Join all threads to ensure they complete before the response is sent
        for thread in threads:
            thread.join()
        hackathons = Hackathon.objects.filter(approval_status='approved')
        serializer = HackathonSerializer(hackathons, many=True)
        return Response({'success': True, 'hackathons': serializer.data})

    elif request.method == 'POST':
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        serializer = HackathonCreateSerializer(data=request.data)
        if serializer.is_valid():
            hackathon = serializer.save(organizer=request.user)
            return Response({'success': True, 'hackathon': HackathonSerializer(hackathon).data}, status=status.HTTP_201_CREATED)
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def hackathon_detail_view(request, id):
    hackathon = get_object_or_404(Hackathon, id=id)

    if request.method == 'GET':
        serializer = HackathonSerializer(hackathon)
        return Response({'success': True, 'hackathon': serializer.data})

    if not request.user.is_authenticated or hackathon.organizer != request.user:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    if request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = HackathonCreateSerializer(hackathon, data=request.data, partial=partial)
        if serializer.is_valid():
            hackathon = serializer.save()
            return Response({'success': True, 'hackathon': HackathonSerializer(hackathon).data})
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        hackathon.delete()
        return Response({'success': True, 'message': 'Hackathon deleted'})

# hackathons/views.py - Add these new views

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def withdraw_application_view(request, application_id):
    """Withdraw/cancel application"""
    application = get_object_or_404(HackathonApplication, id=application_id, user=request.user)
    
    # Check if withdrawal is allowed
    if application.status in ['rejected', 'cancelled']:
        return Response({'error': 'Application cannot be withdrawn'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    # Check if hackathon registration is still open for withdrawal
    if not application.hackathon.is_registration_open and application.status != 'confirmed':
        return Response({'error': 'Cannot withdraw after registration closes'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    # Update application status to cancelled
    old_status = application.status
    application.status = 'cancelled'
    application.save(update_fields=['status', 'updated_at'])
    
    # If application was confirmed, decrease participant count
    if old_status == 'confirmed':
        hackathon = application.hackathon
        hackathon.confirmed_participants = max(0, hackathon.confirmed_participants - 1)
        hackathon.save(update_fields=['confirmed_participants'])
    
    return Response({
        'success': True,
        'message': 'Application withdrawn successfully',
        'application': HackathonApplicationSerializer(application).data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def application_detail_view(request, application_id):
    """Get detailed view of a specific application"""
    application = get_object_or_404(HackathonApplication, id=application_id, user=request.user)
    
    return Response({
        'success': True,
        'application': HackathonApplicationSerializer(application).data,
        'hackathon': HackathonSerializer(application.hackathon).data
    })

# Update the apply view to check capacity constraints
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def hackathon_apply_view(request, id):
    hackathon = get_object_or_404(Hackathon, id=id)
    
    # Check if user already applied
    if HackathonApplication.objects.filter(user=request.user, hackathon=hackathon).exists():
        return Response({'error': 'Already applied'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if registration is still open
    if not hackathon.is_registration_open:
        return Response({'error': 'Registration is closed'}, status=status.HTTP_400_BAD_REQUEST)

    # ✅ NEW: Check capacity constraints
    application_type = request.data.get('application_type', 'individual')
    
    # Check if hackathon is full
    if hackathon.confirmed_participants >= hackathon.max_participants:
        return Response({'error': 'This hackathon is full'}, status=status.HTTP_400_BAD_REQUEST)
    
    # For team registration, check if there's enough space for minimum team size
    if application_type == 'team_leader':
        remaining_spots = hackathon.max_participants - hackathon.confirmed_participants
        if remaining_spots < hackathon.min_team_size:
            if hackathon.registration_type == 'team':
                return Response({'error': 'Not enough spots left for team formation'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            elif hackathon.registration_type == 'both':
                return Response({'error': 'Team registration unavailable. Only individual registration allowed.'}, 
                              status=status.HTTP_400_BAD_REQUEST)

    # Prepare data for serialization
    data = request.data.copy()
    data['hackathon'] = hackathon.id
    
    # Determine status based on hackathon type and application preferences
    application_type = data.get('application_type', 'individual')
    looking_for_team = data.get('looking_for_team', False)
    
    if hackathon.is_free:
        if application_type == 'individual' and not looking_for_team:
            data['status'] = 'confirmed'
            data['payment_status'] = 'not_required'
        else:
            data['status'] = 'team_pending'
            data['payment_status'] = 'not_required'

        user = User.objects.get(pk=request.user.id)
        print(f"User ID: {user.id}")
        print(f"Before increment: {user.total_hackathons_participated}")
        
        # Try the update
        user.total_hackathons_participated += 1
        
        print(f"In memory after increment: {user.total_hackathons_participated}")
        
        user.save(update_fields=['total_hackathons_participated'])
        print(f"After save: {user.total_hackathons_participated}")
        
        # Refresh from database
        hackathon.refresh_from_db()
        print(f"After refresh_from_db: {user.total_hackathons_participated}")
        
        # Verify the change was persisted
        fresh_user = User.objects.get(id=user.id)
        print(f"Fresh from DB: {fresh_user.total_hackathons_participated}")
        
        
        print(f"Hackathon ID: {hackathon.id}")
        print(f"Before increment: {hackathon.confirmed_participants}")
        
        # Try the update
        original_count = hackathon.confirmed_participants
        hackathon.confirmed_participants += 1
        
        print(f"In memory after increment: {hackathon.confirmed_participants}")
        
        hackathon.save(update_fields=['confirmed_participants'])
        print(f"After save: {hackathon.confirmed_participants}")
        
        # Refresh from database
        hackathon.refresh_from_db()
        print(f"After refresh_from_db: {hackathon.confirmed_participants}")
        
        # Verify the change was persisted
        fresh_hackathon = Hackathon.objects.get(id=hackathon.id)
        print(f"Fresh from DB: {fresh_hackathon.confirmed_participants}")
    else:
        data['status'] = 'payment_pending'
        data['payment_status'] = 'pending'
        data['payment_deadline'] = hackathon.registration_end
    
    # Create application
    serializer = HackathonApplicationCreateSerializer(data=data)
    if serializer.is_valid():
        application = serializer.save(user=request.user)
        
        # If confirmed immediately, update participant count
        if application.status == 'confirmed':
            hackathon.confirmed_participants += 1
            hackathon.save(update_fields=['confirmed_participants'])
            application.confirmed_at = timezone.now()
            application.save(update_fields=['confirmed_at'])
        
        return Response({
            'success': True, 
            'application': HackathonApplicationSerializer(application).data
        }, status=status.HTTP_201_CREATED)
    
    return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

# Payment update view
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_payment_view(request, application_id):
    """Update application payment status"""
    application = get_object_or_404(HackathonApplication, id=application_id, user=request.user)
    
    # Check if payment update is allowed
    if application.status != 'payment_pending' or application.payment_status != 'pending':
        return Response({'error': 'Payment update not allowed for this application'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    # Prepare update data for payment confirmation
    if not application.looking_for_team:
        data = {
            'status': 'confirmed',
            'payment_status': 'completed',
            'confirmed_at': timezone.now(),
            'amount_paid': request.data.get('amount_paid', application.hackathon.registration_fee),
            'payment_id': request.data.get('payment_id', f'payment_{int(timezone.now().timestamp())}')
        }
    else:
        data = {
            'status': 'team_pending',
            'payment_status': 'completed',
            'confirmed_at': timezone.now(),
            'amount_paid': request.data.get('amount_paid', application.hackathon.registration_fee),
            'payment_id': request.data.get('payment_id', f'payment_{int(timezone.now().timestamp())}')
        }
    
    serializer = HackathonApplicationUpdateSerializer(application, data=data, partial=True)
    if serializer.is_valid():
        updated_application = serializer.save()

        user = User.objects.get(pk=request.user.id)
        print(f"User ID: {user.id}")
        print(f"Before increment: {user.total_hackathons_participated}")
        # Try the update
        user.total_hackathons_participated += 1
        print(f"In memory after increment: {user.total_hackathons_participated}")
        user.save(update_fields=['total_hackathons_participated'])
        print(f"After save: {user.total_hackathons_participated}")
        # Refresh from database
        user.refresh_from_db()
        print(f"After refresh_from_db: {user.total_hackathons_participated}")        
        # Verify the change was persisted
        fresh_user = User.objects.get(id=user.id)
        print(f"Fresh from DB: {fresh_user.total_hackathons_participated}")
        
        # Update participant count
        hackathon = updated_application.hackathon
        print(f"Hackathon ID: {hackathon.id}")
        print(f"Before increment: {hackathon.confirmed_participants}")
        
        # Try the update
        original_count = hackathon.confirmed_participants
        hackathon.confirmed_participants += 1
        
        print(f"In memory after increment: {hackathon.confirmed_participants}")
        
        hackathon.save(update_fields=['confirmed_participants'])
        print(f"After save: {hackathon.confirmed_participants}")
        
        # Refresh from database
        hackathon.refresh_from_db()
        print(f"After refresh_from_db: {hackathon.confirmed_participants}")
        
        # Verify the change was persisted
        fresh_hackathon = Hackathon.objects.get(id=hackathon.id)
        print(f"Fresh from DB: {fresh_hackathon.confirmed_participants}")
        
        return Response({
            'success': True,
            'application': HackathonApplicationSerializer(updated_application).data
        })
    
    return Response({'success': False, 'errors': serializer.errors}, 
                   status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_applications_view(request):
    applications = HackathonApplication.objects.filter(user=request.user).select_related('hackathon')
    serializer = HackathonApplicationSerializer(applications, many=True)
    return Response({'success': True, 'applications': serializer.data})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_organized_view(request):
    hackathons = Hackathon.objects.filter(organizer=request.user)
    serializer = HackathonSerializer(hackathons, many=True)
    return Response({'success': True, 'hackathons': serializer.data})

@api_view(['GET'])
def hackathon_categories_api(request):
    categories = set()
    for hackathon in Hackathon.objects.filter(
        approval_status='approved',
        status__in=['published', 'registration_open', 'ongoing']
    ):
        categories.update(hackathon.categories)
    return Response({'success': True, 'categories': sorted(categories)})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def hackathon_applications_view(request, id):
    """Get all applications for a specific hackathon (organizer only)"""
    hackathon = get_object_or_404(Hackathon, id=id)
    
    # Check if user is the organizer
    if hackathon.organizer != request.user:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    applications = HackathonApplication.objects.filter(hackathon=hackathon).select_related('user')
    
    applications_data = []
    for app in applications:
        applications_data.append({
            'id': app.id,
            'user_name': app.user.name if hasattr(app.user, 'name') else app.user.username,
            'user_email': app.user.email,
            'application_type': app.application_type,
            'status': app.status,
            'applied_at': app.applied_at,
            'skills_bringing': app.skills_bringing,
            'project_ideas': app.project_ideas,
        })
    
    return Response({
        'success': True,
        'applications': applications_data
    })


from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import HackathonApplication, Hackathon
from users.models import User
import json

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_hackathons(request):
    """Get hackathons the user has participated in"""
    try:
        user = request.user
        
        # Get hackathons where user has applied and is confirmed
        applications = HackathonApplication.objects.filter(
            user=user,
            status__in=['confirmed', 'applied', 'team_pending']
        ).select_related('hackathon')
        
        hackathons = []
        for app in applications:
            hackathons.append({
                'id': app.hackathon.id,
                'title': app.hackathon.title,
                'start_date': app.hackathon.start_date,
                'status': app.hackathon.status,
                'total_participants': app.hackathon.confirmed_participants
            })
        
        return Response({
            'success': True,
            'hackathons': hackathons
        })
    
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error fetching hackathons: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_hackathon_participants(request):
    """Get participants for a specific hackathon with matching algorithm"""
    try:
        hackathon_id = request.data.get('hackathon_id')
        
        if not hackathon_id:
            return Response({
                'success': False,
                'message': 'Hackathon ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get the hackathon
        try:
            hackathon = Hackathon.objects.get(id=hackathon_id)
        except Hackathon.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Hackathon not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get current user's application
        try:
            current_user_app = HackathonApplication.objects.get(
                hackathon=hackathon,
                user=request.user
            )
        except HackathonApplication.DoesNotExist:
            return Response({
                'success': False,
                'message': 'You are not registered for this hackathon'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get all confirmed participants except current user
        other_applications = HackathonApplication.objects.filter(
            hackathon=hackathon,
            status__in=['team_pending'],
            payment_status__in=['completed', 'not_required']
        ).exclude(user=request.user).select_related('user')
        
        # Calculate matches using the matching algorithm
        matches = calculate_participant_matches(current_user_app, other_applications)
        
        return Response({
            'success': True,
            'participants': matches,
            'total_count': len(matches)
        })
    
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error fetching participants: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# def calculate_participant_matches(current_user_app, other_applications):
#     """
#     Advanced matching algorithm for hackathon participants
#     """
#     current_user = current_user_app.user
#     current_skills = set(current_user.skills or [])
#     current_bringing_skills = set(current_user_app.skills_bringing or [])
#     current_interests = set(current_user.interests or [])
#     current_preferred_roles = set(current_user_app.preferred_roles or [])
    
#     matches = []
    
#     for app in other_applications:
#         participant = app.user
#         match_score = 0
#         complementary_skills = []
#         shared_skills = []
        
#         # Get participant data
#         participant_skills = set(participant.skills or [])
#         participant_bringing_skills = set(app.skills_bringing or [])
#         participant_interests = set(participant.interests or [])
#         participant_preferred_roles = set(app.preferred_roles or [])
        
#         # 1. Skills Matching (30% weight)
#         # Shared skills (good for collaboration)
#         shared_skill_set = current_skills.intersection(participant_skills)
#         shared_bringing_skills = current_bringing_skills.intersection(participant_bringing_skills)
#         shared_skills.extend(list(shared_skill_set))
        
#         if shared_skill_set:
#             match_score += len(shared_skill_set) * 3
        
#         # Complementary skills (great for diverse teams)
#         complementary_skill_set = participant_skills - current_skills
#         complementary_bringing_set = participant_bringing_skills - current_bringing_skills
#         complementary_skills.extend(list(complementary_skill_set))
#         complementary_skills.extend(list(complementary_bringing_set))
        
#         if complementary_skill_set or complementary_bringing_set:
#             match_score += len(complementary_skill_set) * 4  # Higher weight for complementary
#             match_score += len(complementary_bringing_set) * 5
        
#         # 2. Experience Level Matching (20% weight)
#         experience_levels = ['beginner', 'intermediate', 'advanced']
#         current_exp_idx = experience_levels.index(current_user.experience_level) if current_user.experience_level in experience_levels else 1
#         participant_exp_idx = experience_levels.index(participant.experience_level) if participant.experience_level in experience_levels else 1
        
#         # Prefer similar or slightly higher experience
#         exp_diff = abs(current_exp_idx - participant_exp_idx)
#         if exp_diff == 0:
#             match_score += 15  # Same level
#         elif exp_diff == 1:
#             match_score += 10  # One level difference
#         else:
#             match_score += 5   # More than one level difference
        
#         # 3. Location Matching (10% weight)
#         if current_user.location and participant.location:
#             if current_user.location.lower() == participant.location.lower():
#                 match_score += 10
#             elif any(word in participant.location.lower() for word in current_user.location.lower().split()):
#                 match_score += 5
        
#         # 4. GitHub Presence (5% weight)
#         if current_user.github_url and participant.github_url:
#             match_score += 8
#         elif participant.github_url:  # They have GitHub, good for collaboration
#             match_score += 5
        
#         # 5. Preferred Roles Compatibility (15% weight)
#         if current_preferred_roles and participant_preferred_roles:
#             role_overlap = current_preferred_roles.intersection(participant_preferred_roles)
#             complementary_roles = participant_preferred_roles - current_preferred_roles
            
#             # Some role overlap is good but not too much
#             if len(role_overlap) == 1:
#                 match_score += 12
#             elif len(role_overlap) == 0 and complementary_roles:
#                 match_score += 15  # Perfect complementary roles
#             elif len(role_overlap) > 1:
#                 match_score += 8   # Too much overlap
        
#         # 6. Interests Alignment (10% weight)
#         shared_interests = current_interests.intersection(participant_interests)
#         if shared_interests:
#             match_score += len(shared_interests) * 3
        
#         # 7. Hackathon Experience & Performance (10% weight)
#         # More experienced participants are valuable
#         exp_score = min(participant.total_hackathons_participated * 2, 15)
#         match_score += exp_score
        
#         # Winners are highly valuable
#         if participant.hackathons_won > 0:
#             match_score += min(participant.hackathons_won * 3, 12)
        
#         # High rating participants
#         if participant.average_rating > 0:
#             match_score += min(int(participant.average_rating * 2), 10)
        
#         # 8. Team Formation Preferences (bonus)
#         if app.looking_for_team and current_user_app.looking_for_team:
#             match_score += 8
        
#         if app.open_to_remote_collaboration and current_user_app.open_to_remote_collaboration:
#             match_score += 5
        
#         # Convert to percentage (max possible score ~100)
#         compatibility_percentage = min(int(match_score), 100)
        
#         # Prepare participant data
#         participant_data = {
#             'id': participant.id,
#             'name': participant.name,
#             'bio': participant.bio,
#             'location': participant.location or 'Not specified',
#             'experience': participant.experience_level,
#             'skills': list(participant_skills),
#             'complementarySkills': complementary_skills[:5],  # Top 5 complementary skills
#             'sharedSkills': shared_skills[:3],  # Top 3 shared skills
#             'interests': list(participant_interests),
#             'github': participant.github_url,
#             'linkedin': participant.linkedin_url,
#             'portfolio': participant.portfolio_url,
#             'rating': float(participant.average_rating),
#             'hackathonsParticipated': participant.total_hackathons_participated,
#             'hackathonsWon': participant.hackathons_won,
#             'compatibility': compatibility_percentage,
#             'lookingForTeam': app.looking_for_team,
#             'preferredRoles': list(participant_preferred_roles),
#             'openToRemote': app.open_to_remote_collaboration,
#             'projectIdeas': app.project_ideas,
#             'skillsBringing': list(participant_bringing_skills),
#             'applicationStatus': app.status,
#             'appliedAt': app.applied_at.isoformat()
#         }
        
#         matches.append(participant_data)
    
#     # Sort by compatibility score (highest first)
#     matches.sort(key=lambda x: x['compatibility'], reverse=True)
    
#     return matches

# Add these imports to your existing views.py
import requests
from urllib.parse import urlparse
import re
from datetime import datetime, timedelta

# Add this helper function to your existing views.py
def validate_and_get_github_info(github_url):
    """
    Validate GitHub URL and get contribution information with robust error handling
    Returns: {
        'is_valid': bool,
        'username': str,
        'contributions_last_year': int,
        'public_repos': int,
        'followers': int,
        'is_active': bool
    }
    """
    if not github_url:
        return {'is_valid': False}
    
    try:
        # Handle different GitHub URL formats
        if isinstance(github_url, list):
            return {'is_valid': False, 'error': 'GitHub URL should be a string, not a list'}
        
        # Ensure it's a string and clean it
        github_url = str(github_url).strip()
        
        # Add protocol if missing
        if not github_url.startswith(('http://', 'https://')):
            github_url = 'https://' + github_url
        
        # Extract username from GitHub URL
        parsed_url = urlparse(github_url)
        if 'github.com' not in parsed_url.netloc.lower():
            return {'is_valid': False, 'error': 'Not a GitHub URL'}
        
        # 🔧 FIXED: Extract username from path (corrected the order)
        path_parts = parsed_url.path.strip('/').split('/')  # Split first, then index
        print(f"Path parts: {path_parts}")
        
        if not path_parts or not path_parts[0]:
            return {'is_valid': False, 'error': 'No username found in URL'}
        
        username = path_parts[0]
        print(f"Extracted username: {username}")
        
        # 🔧 FIXED: Clean username (corrected the split operations)
        # username = username.split('?')[0]  # Remove query parameters
        # username = username.split('#')  # Remove fragments
        
        # Validate username format (GitHub username rules)
        if not re.match(r'^[a-zA-Z0-9]([a-zA-Z0-9-]){0,38}$', username):
            return {'is_valid': False, 'error': f'Invalid GitHub username format: {username}'}
        
        # At this point, we have a valid GitHub URL format
        # Try to get additional info from GitHub API, but don't fail if API is down
        try:
            headers = {
                'User-Agent': 'HackathonPlatform/1.0',
                'Accept': 'application/vnd.github.v3+json'
            }
            
            # Get user info with shorter timeout
            user_response = requests.get(
                f'https://api.github.com/users/{username}',
                timeout=3,  # Reduced timeout
                headers=headers
            )
            
            if user_response.status_code == 200:
                user_data = user_response.json()
                
                # Try to get recent activity
                contributions_last_year = 0
                is_active = False
                
                try:
                    events_response = requests.get(
                        f'https://api.github.com/users/{username}/events/public',
                        timeout=2,  # Even shorter timeout for events
                        headers=headers
                    )
                    
                    if events_response.status_code == 200:
                        events = events_response.json()
                        
                        # Count recent activity
                        three_months_ago = datetime.now() - timedelta(days=90)
                        one_year_ago = datetime.now() - timedelta(days=365)
                        
                        for event in events[:20]:  # Check fewer events for speed
                            try:
                                event_date = datetime.strptime(event['created_at'], '%Y-%m-%dT%H:%M:%SZ')
                                
                                if event_date > three_months_ago:
                                    is_active = True
                                
                                if event_date > one_year_ago and event['type'] in ['PushEvent', 'CreateEvent', 'PullRequestEvent', 'IssuesEvent']:
                                    contributions_last_year += 1
                            except (KeyError, ValueError, TypeError):
                                continue
                except:
                    # If events API fails, continue with user data
                    pass
                
                return {
                    'is_valid': True,
                    'username': username,
                    'contributions_last_year': min(contributions_last_year * 8, 400),  # Estimated
                    'public_repos': user_data.get('public_repos', 0),
                    'followers': user_data.get('followers', 0),
                    'is_active': is_active,
                    'created_at': user_data.get('created_at'),
                    'avatar_url': user_data.get('avatar_url'),
                    'name': user_data.get('name') or username,
                    'bio': user_data.get('bio'),
                    'api_success': True
                }
            
            elif user_response.status_code == 404:
                return {'is_valid': False, 'error': 'GitHub user not found'}
            
            elif user_response.status_code == 403:
                # Rate limited - return valid URL but no API data
                return {
                    'is_valid': True,
                    'username': username,
                    'contributions_last_year': 0,
                    'public_repos': 0,
                    'followers': 0,
                    'is_active': False,
                    'api_failed': True,
                    'error': 'GitHub API rate limited'
                }
            
            else:
                # Other API error - return valid URL but no API data
                return {
                    'is_valid': True,
                    'username': username,
                    'contributions_last_year': 0,
                    'public_repos': 0,
                    'followers': 0,
                    'is_active': False,
                    'api_failed': True,
                    'error': f'GitHub API error: {user_response.status_code}'
                }
                
        except requests.exceptions.Timeout:
            # Timeout - return valid URL but no API data
            return {
                'is_valid': True,
                'username': username,
                'contributions_last_year': 0,
                'public_repos': 0,
                'followers': 0,
                'is_active': False,
                'api_failed': True,
                'error': 'GitHub API timeout'
            }
            
        except requests.exceptions.RequestException as e:
            # Network error - return valid URL but no API data
            return {
                'is_valid': True,
                'username': username,
                'contributions_last_year': 0,
                'public_repos': 0,
                'followers': 0,
                'is_active': False,
                'api_failed': True,
                'error': f'Network error: {str(e)}'
            }
    
    except Exception as e:
        return {'is_valid': False, 'error': f'URL parsing error: {str(e)}'}

# Update your existing calculate_participant_matches function
def calculate_participant_matches(current_user_app, other_applications):
    """
    Enhanced matching algorithm with GitHub validation and contributions
    """
    current_user = current_user_app.user
    current_skills = set(current_user.skills or [])
    current_bringing_skills = set(current_user_app.skills_bringing or [])
    current_interests = set(current_user.interests or [])
    current_preferred_roles = set(current_user_app.preferred_roles or [])
    
    # Get current user's GitHub info
    current_github_info = validate_and_get_github_info(current_user.github_url)
    
    matches = []
    
    for app in other_applications:
        participant = app.user
        match_score = 0
        complementary_skills = []
        shared_skills = []
        github_info = {}
        
        # Get participant data
        participant_skills = set(participant.skills or [])
        participant_bringing_skills = set(app.skills_bringing or [])
        participant_interests = set(participant.interests or [])
        participant_preferred_roles = set(app.preferred_roles or [])
        
        # Get participant's GitHub info
        participant_github_info = validate_and_get_github_info(participant.github_url)
        print(participant_github_info)
        # 1. Skills Matching (25% weight - reduced to make room for GitHub)
        shared_skill_set = current_skills.intersection(participant_skills)
        shared_bringing_skills = current_bringing_skills.intersection(participant_bringing_skills)
        shared_skills.extend(list(shared_skill_set))
        
        if shared_skill_set:
            match_score += len(shared_skill_set) * 2.5
        
        complementary_skill_set = participant_skills - current_skills
        complementary_bringing_set = participant_bringing_skills - current_bringing_skills
        complementary_skills.extend(list(complementary_skill_set))
        complementary_skills.extend(list(complementary_bringing_set))
        
        if complementary_skill_set or complementary_bringing_set:
            match_score += len(complementary_skill_set) * 3.5
            match_score += len(complementary_bringing_set) * 4.5
        
        # 2. Experience Level Matching (15% weight)
        experience_levels = ['beginner', 'intermediate', 'advanced']
        current_exp_idx = experience_levels.index(current_user.experience_level) if current_user.experience_level in experience_levels else 1
        participant_exp_idx = experience_levels.index(participant.experience_level) if participant.experience_level in experience_levels else 1
        
        exp_diff = abs(current_exp_idx - participant_exp_idx)
        if exp_diff == 0:
            match_score += 12
        elif exp_diff == 1:
            match_score += 8
        else:
            match_score += 4
        
        # 3. Enhanced GitHub Scoring (20% weight)
        github_score = 0
        
        if participant_github_info.get('is_valid'):
            github_info = participant_github_info
            
            # Valid GitHub URL bonus
            github_score += 5
            
            # Active contributor bonus
            if participant_github_info.get('is_active'):
                github_score += 8
            
            # Contributions scoring (0-500+ contributions)
            contributions = participant_github_info.get('contributions_last_year', 0)
            if contributions > 200:
                github_score += 10
            elif contributions > 100:
                github_score += 7
            elif contributions > 50:
                github_score += 5
            elif contributions > 10:
                github_score += 3
            
            # Repository count bonus
            repos = participant_github_info.get('public_repos', 0)
            if repos > 20:
                github_score += 6
            elif repos > 10:
                github_score += 4
            elif repos > 5:
                github_score += 2
            
            # Followers bonus (indicates community engagement)
            followers = participant_github_info.get('followers', 0)
            if followers > 50:
                github_score += 4
            elif followers > 10:
                github_score += 2
            
            # Account age bonus (established developers)
            if participant_github_info.get('created_at'):
                try:
                    created_date = datetime.strptime(participant_github_info['created_at'], '%Y-%m-%dT%H:%M:%SZ')
                    account_age_years = (datetime.now() - created_date).days / 365
                    if account_age_years > 3:
                        github_score += 3
                    elif account_age_years > 1:
                        github_score += 2
                except:
                    pass
        
        elif participant.github_url:
            # Invalid GitHub URL penalty
            github_score -= 3
            github_info = {'is_valid': False, 'invalid_url': True}
        
        match_score += github_score
        
        # 4. Location Matching (8% weight)
        if current_user.location and participant.location:
            if current_user.location.lower() == participant.location.lower():
                match_score += 8
            elif any(word in participant.location.lower() for word in current_user.location.lower().split()):
                match_score += 4
        
        # 5. Preferred Roles Compatibility (12% weight)
        if current_preferred_roles and participant_preferred_roles:
            role_overlap = current_preferred_roles.intersection(participant_preferred_roles)
            complementary_roles = participant_preferred_roles - current_preferred_roles
            
            if len(role_overlap) == 1:
                match_score += 10
            elif len(role_overlap) == 0 and complementary_roles:
                match_score += 12
            elif len(role_overlap) > 1:
                match_score += 6
        
        # 6. Interests Alignment (8% weight)
        shared_interests = current_interests.intersection(participant_interests)
        if shared_interests:
            match_score += len(shared_interests) * 2.5
        
        # 7. Hackathon Experience & Performance (12% weight)
        exp_score = min(participant.total_hackathons_participated * 1.5, 12)
        match_score += exp_score
        
        if participant.hackathons_won > 0:
            match_score += min(participant.hackathons_won * 3, 10)
        
        if participant.average_rating > 0:
            match_score += min(int(participant.average_rating * 2), 8)
        
        # 8. Team Formation Preferences (bonus)
        if app.looking_for_team and current_user_app.looking_for_team:
            match_score += 6
        
        if app.open_to_remote_collaboration and current_user_app.open_to_remote_collaboration:
            match_score += 4
        
        # Convert to percentage (max possible score ~110, normalize to 100)
        compatibility_percentage = min(int(match_score * 0.87), 100)  # Adjust multiplier as needed
        
        # Prepare participant data with GitHub info
        participant_data = {
            'id': participant.id,
            'name': participant.name,
            'bio': participant.bio,
            'location': participant.location or 'Not specified',
            'experience': participant.experience_level,
            'skills': list(participant_skills),
            'complementarySkills': complementary_skills[:5],
            'sharedSkills': shared_skills[:3],
            'interests': list(participant_interests),
            'github': participant.github_url,
            'githubInfo': github_info,  # New field with validation and stats
            'linkedin': participant.linkedin_url,
            'portfolio': participant.portfolio_url,
            'rating': float(participant.average_rating),
            'hackathonsParticipated': participant.total_hackathons_participated,
            'hackathonsWon': participant.hackathons_won,
            'compatibility': compatibility_percentage,
            'lookingForTeam': app.looking_for_team,
            'preferredRoles': list(participant_preferred_roles),
            'openToRemote': app.open_to_remote_collaboration,
            'projectIdeas': app.project_ideas,
            'skillsBringing': list(participant_bringing_skills),
            'applicationStatus': app.status,
            'appliedAt': app.applied_at.isoformat()
        }
        
        matches.append(participant_data)
    
    # Sort by compatibility score (highest first)
    matches.sort(key=lambda x: x['compatibility'], reverse=True)
    
    return matches

