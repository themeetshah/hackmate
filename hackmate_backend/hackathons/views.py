from django.shortcuts import render

# Create your views here.
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, permissions, filters, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django_filters.rest_framework import DjangoFilterBackend
from .models import Hackathon, FavoriteHackathon
from .serializers import HackathonSerializer, FavoriteHackathonSerializer, HackathonCreateSerializer
from django.db.models import Q


class HackathonListCreateView(generics.ListCreateAPIView):
	queryset = Hackathon.objects.all().order_by('-start_date')
	serializer_class = HackathonSerializer
	filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
	filterset_fields = ['platform', 'is_virtual', 'themes', 'location', 'prize_pool']
	search_fields = ['title', 'description', 'themes', 'sponsors', 'tags']
	ordering_fields = ['start_date', 'prize_pool', 'participants', 'registration_deadline']


class HackathonRetrieveView(generics.RetrieveAPIView):
	queryset = Hackathon.objects.all()
	serializer_class = HackathonSerializer
	def get_serializer_context(self):

		context = super().get_serializer_context()
		hackathon = self.get_object()
		context["is_organiser"] = (self.request.user.is_authenticated and hackathon.created_by_id == self.request.user.id)
		return context

class FavoriteHackathonListCreateView(generics.ListCreateAPIView):
	serializer_class = FavoriteHackathonSerializer
	permission_classes = [permissions.IsAuthenticated]

	def get_queryset(self):
		return FavoriteHackathon.objects.filter(user=self.request.user)

	def perform_create(self, serializer):
		serializer.save(user=self.request.user)


class FavoriteHackathonDeleteView(generics.DestroyAPIView):
	serializer_class = FavoriteHackathonSerializer
	permission_classes = [permissions.IsAuthenticated]

	def get_queryset(self):
		return FavoriteHackathon.objects.filter(user=self.request.user)


class HackathonSearchView(generics.ListAPIView):
	serializer_class = HackathonSerializer

	def get_queryset(self):
		query = self.request.query_params.get('q', '')
		return Hackathon.objects.filter(
			Q(title__icontains=query) |
			Q(description__icontains=query) |
			Q(themes__icontains=query) |
			Q(tags__icontains=query)
		)
	

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_hackathon(request):
    serializer = HackathonCreateSerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        hackathon = serializer.save(created_by=request.user, is_user_created=True)
        return Response(
            {"message": "Hackathon created successfully", "id": hackathon.id},
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def publish_hackathon(request, hackathon_id):
    try:
        hackathon = Hackathon.objects.get(id=hackathon_id, created_by=request.user)
    except Hackathon.DoesNotExist:
        return Response(
            {"error": "Hackathon not found or you are not the creator"},
            status=status.HTTP_404_NOT_FOUND
        )

    if not hackathon.is_user_created:
        return Response(
            {"error": "You can only publish hackathons created on this platform"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # update publish flag
    publish_status = request.data.get("is_published")
    if publish_status is None:
        return Response({"error": "Send 'is_published' field (true/false)"}, status=400)

    hackathon.is_published = bool(publish_status)
    hackathon.save()

    return Response(
        {
            "message": "Hackathon publish status updated",
            "id": hackathon.id,
            "is_published": hackathon.is_published
        },
        status=status.HTTP_200_OK
    )
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def edit_hackathon(request, pk):
    # Only allow the creator of a user-created hackathon to edit
    hackathon = get_object_or_404(
        Hackathon,
        pk=pk,
        created_by=request.user,
        is_user_created=True
    )

    serializer = HackathonSerializer(hackathon, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
