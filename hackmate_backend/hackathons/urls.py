from django.urls import path
from . import views

app_name = 'hackathons'

urlpatterns = [
    path('', views.hackathon_list_view, name='list'),  # GET: list hackathons, POST: create hackathon
    path('<int:id>/', views.hackathon_detail_view, name='detail'),  # GET, PUT, PATCH, DELETE specific hackathon
    path('<int:id>/apply/', views.hackathon_apply_view, name='apply'),  # POST apply to hackathon
    path('my/applications/', views.my_applications_view, name='my_applications'),  # GET user's applications
    path('my/organized/', views.my_organized_view, name='my_organized'),  # GET user's organized hackathons
    path('api/categories/', views.hackathon_categories_api, name='api_categories'),  # GET categories
]
