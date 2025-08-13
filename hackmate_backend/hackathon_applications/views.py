from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework import status
from django.utils import timezone
from .models import HackathonApplication, ApplicationForm, ApplicationResponse
from hackathons.models import Hackathon
from .serializers import (
    HackathonApplicationCreateSerializer,
    HackathonApplicationListSerializer,
    ApplicationFormSerializer,
    ApplicationResponseSerializer,
    HackathonApplicationDetailSerializer,
    HackathonApplicationStatusSerializer
)
### ---- Apply to Hackathons ---- ###
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def apply_to_hackathon(request, hackathon_id):
    # Check if hackathon exists and can receive applications
    try:
        hackathon = Hackathon.objects.get(id=hackathon_id, is_user_created=True, is_published=True)
    except Hackathon.DoesNotExist:
        return Response(
            {"error": "Hackathon not found or not open for applications"},
            status=status.HTTP_404_NOT_FOUND
        )

    # Prevent duplicate applications
    if HackathonApplication.objects.filter(user=request.user, hackathon=hackathon).exists():
        return Response(
            {"error": "You have already applied to this hackathon"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Create the application
    serializer = HackathonApplicationCreateSerializer(
        data=request.data,
        context={"request": request, "hackathon": hackathon}
    )
    if serializer.is_valid():
        application = serializer.save(
            user=request.user,
            hackathon=hackathon,
            status="submitted",
            submitted_at=timezone.now()
        )
        return Response(
            {"message": "Application submitted successfully", "id": application.id},
            status=status.HTTP_201_CREATED
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

### ---- See my applications ---- ###
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_applications(request):
    apps = HackathonApplication.objects.filter(user=request.user)
    serializer = HackathonApplicationListSerializer(apps, many=True)
    return Response(serializer.data)


### ---- Organiser: View applications for my hackathon ---- ###
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_applications_for_hackathon(request, hackathon_id):
    try:
        hackathon = Hackathon.objects.get(id=hackathon_id, created_by=request.user,is_user_created=True)
    except Hackathon.DoesNotExist:
        return Response({"error": "Hackathon not found or you are not the creator"}, status=404)

    apps = HackathonApplication.objects.filter(hackathon=hackathon)
    serializer = HackathonApplicationListSerializer(apps, many=True)
    return Response(serializer.data)


### ---- Manage Custom Application Form ---- ###
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_or_update_application_form(request, hackathon_id):
    try:
        hackathon = Hackathon.objects.get(id=hackathon_id, created_by=request.user,is_user_created=True)
    except Hackathon.DoesNotExist:
        return Response({"error": "Hackathon not found or you are not the creator"}, status=404)

    try:
        form = ApplicationForm.objects.get(hackathon=hackathon)
        serializer = ApplicationFormSerializer(form, data=request.data, partial=True)
    except ApplicationForm.DoesNotExist:
        serializer = ApplicationFormSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save(hackathon=hackathon)
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


### ---- Submit Custom Application Responses ---- ###
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_application_responses(request, application_id):
    try:
        app = HackathonApplication.objects.get(id=application_id, user=request.user)
    except HackathonApplication.DoesNotExist:
        return Response({"error": "Application not found"}, status=404)

    try:
        resp = ApplicationResponse.objects.get(application=app)
        serializer = ApplicationResponseSerializer(resp, data=request.data, partial=True)
    except ApplicationResponse.DoesNotExist:
        serializer = ApplicationResponseSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save(application=app)
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def application_detail(request, application_id):
    # Get the application
    application = get_object_or_404(HackathonApplication, pk=application_id)
    
    # Check permission: organiser of related hackathon OR applicant themselves
    if not (
        application.user == request.user or 
        (application.hackathon.created_by == request.user and application.hackathon.is_user_created)
    ):
        return Response({"error": "Not permitted"}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = HackathonApplicationDetailSerializer(application)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def change_application_status(request, application_id):
    # Find application & ensure organiser owns the related hackathon
    application = get_object_or_404(
        HackathonApplication,
        pk=application_id,
        hackathon__created_by=request.user,
        hackathon__is_user_created=True
    )

    serializer = HackathonApplicationStatusSerializer(application, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({
            "message": "Status updated successfully",
            "id": application.id,
            "status": serializer.data.get("status"),
            "reviewer_notes": serializer.data.get("reviewer_notes")
        }, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def application_stats(request, hackathon_id):
    # Make sure the hackathon belongs to the logged-in organiser and is user-created
    hackathon = get_object_or_404(
        Hackathon,
        pk=hackathon_id,
        created_by=request.user,
        is_user_created=True
    )

    # Count applications by status
    total = HackathonApplication.objects.filter(hackathon=hackathon).count()
    submitted = HackathonApplication.objects.filter(hackathon=hackathon, status='submitted').count()
    accepted = HackathonApplication.objects.filter(hackathon=hackathon, status='accepted').count()
    rejected = HackathonApplication.objects.filter(hackathon=hackathon, status='rejected').count()
    waitlisted = HackathonApplication.objects.filter(hackathon=hackathon, status='waitlisted').count()

    return Response({
        "hackathon_id": hackathon.id,
        "total": total,
        "submitted": submitted,
        "accepted": accepted,
        "rejected": rejected,
        "waitlisted": waitlisted
    })