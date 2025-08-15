from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Hackathon, HackathonApplication
from .serializers import HackathonSerializer, HackathonCreateSerializer, HackathonApplicationCreateSerializer, HackathonApplicationSerializer

@api_view(['GET', 'POST'])
def hackathon_list_view(request):
    if request.method == 'GET':
        hackathons = Hackathon.objects.filter(status__in=['published'])
        # print(Hackathon.objects.all())
        serializer = HackathonSerializer(hackathons, many=True)
        return Response({'success': True, 'hackathons': serializer.data})

    elif request.method == 'POST':
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        serializer = HackathonCreateSerializer(data=request.data)
        print(request.data)
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def hackathon_apply_view(request, id):
    hackathon = get_object_or_404(Hackathon, id=id)

    if HackathonApplication.objects.filter(user=request.user, hackathon=hackathon).exists():
        return Response({'error': 'Already applied'}, status=status.HTTP_400_BAD_REQUEST)

    data = request.data.copy()
    data['hackathon'] = hackathon.id
    serializer = HackathonApplicationCreateSerializer(data=data)
    if serializer.is_valid():
        application = serializer.save(user=request.user)
        return Response({'success': True, 'application': HackathonApplicationSerializer(application).data}, status=status.HTTP_201_CREATED)
    return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_applications_view(request):
    applications = HackathonApplication.objects.filter(user=request.user)
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
