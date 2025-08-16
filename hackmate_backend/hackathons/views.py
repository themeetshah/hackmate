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
        hackathons = Hackathon.objects.all()
        
        threads = []
        for hackathon in hackathons:
            # Create a new thread for each hackathon update
            thread = Thread(target=update_hackathon_status, args=(hackathon.id,))
            threads.append(thread)
            thread.start() # Start the thread
        
        # Join all threads to ensure they complete before the response is sent
        for thread in threads:
            thread.join()
        hackathons = Hackathon.objects.all()
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
            data['status'] = 'applied'
            data['payment_status'] = 'not_required'
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
    data = {
        'status': 'confirmed',
        'payment_status': 'completed',
        'confirmed_at': timezone.now(),
        'amount_paid': request.data.get('amount_paid', application.hackathon.registration_fee),
        'payment_id': request.data.get('payment_id', f'payment_{int(timezone.now().timestamp())}')
    }
    
    serializer = HackathonApplicationUpdateSerializer(application, data=data, partial=True)
    if serializer.is_valid():
        updated_application = serializer.save()
        
        # Update participant count
        hackathon = updated_application.hackathon
        hackathon.confirmed_participants += 1
        hackathon.save(update_fields=['confirmed_participants'])
        
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
    for hackathon in Hackathon.objects.filter(status__in=['published', 'registration_open', 'ongoing']):
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