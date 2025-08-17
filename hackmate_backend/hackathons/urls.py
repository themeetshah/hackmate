from django.urls import path
from . import views

app_name = 'hackathons'

urlpatterns = [
    path('', views.hackathon_list_view, name='list'),  # GET: list hackathons, POST: create hackathon
    path('<int:id>/', views.hackathon_detail_view, name='detail'),  # GET, PUT, PATCH, DELETE specific hackathon
    path('<int:id>/apply/', views.hackathon_apply_view, name='apply'),  # POST apply to hackathon
    path('<int:id>/applications/', views.hackathon_applications_view, name='hackathon_applications'),
    path('applications/<int:application_id>/withdraw/', views.withdraw_application_view, name='withdraw_application'),  # NEW
    path('applications/<int:application_id>/', views.application_detail_view, name='application_detail'),
    path('applications/<int:application_id>/payment/', views.update_payment_view, name='update_payment'),
    path('my/applications/', views.my_applications_view, name='my_applications'),  # GET user's applications
    path('my/organized/', views.my_organized_view, name='my_organized'),  # GET user's organized hackathons
    path('api/categories/', views.hackathon_categories_api, name='api_categories'),  # GET categories

    path('matching/user-hackathons/', views.get_user_hackathons, name='user_hackathons'),
    path('matching/participants/', views.get_hackathon_participants, name='hackathon_participants'),
]
