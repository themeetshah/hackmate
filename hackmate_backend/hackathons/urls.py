from django.urls import path
from .views import HackathonListCreateView, HackathonRetrieveView, FavoriteHackathonListCreateView, FavoriteHackathonDeleteView, HackathonSearchView , create_hackathon  , publish_hackathon,edit_hackathon

urlpatterns = [
    path('', HackathonListCreateView.as_view(), name='hackathon-list-create'),
    path('create/', create_hackathon, name='hackathon-create'),
    path('<int:pk>/', HackathonRetrieveView.as_view(), name='hackathon-detail'),
    path('favorites/', FavoriteHackathonListCreateView.as_view(), name='favorite-hackathon-list-create'),
    path('favorites/<int:pk>/', FavoriteHackathonDeleteView.as_view(), name='favorite-hackathon-delete'),
    path('search/', HackathonSearchView.as_view(), name='hackathon-search'),
    path('<int:hackathon_id>/publish/', publish_hackathon, name='hackathon-publish'),
    path('<int:pk>/edit/', edit_hackathon, name='hackathon-edit'),
]
