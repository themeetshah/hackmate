from django.urls import path
from .views import (
    apply_to_hackathon,
    my_applications,
    view_applications_for_hackathon,
    create_or_update_application_form,
    submit_application_responses,
    application_detail,
    change_application_status,
    application_stats
)

urlpatterns = [
    path("apply/<int:hackathon_id>/", apply_to_hackathon, name="apply-to-hackathon"),
    path("my/", my_applications, name="my-applications"),
    path("organiser/<int:hackathon_id>/", view_applications_for_hackathon, name="view-applications"),
    path("organiser/<int:hackathon_id>/form/", create_or_update_application_form, name="create-form"),
    path("responses/<int:application_id>/", submit_application_responses, name="application-responses"),
    path('<int:application_id>/', application_detail, name='application-detail'),
    path('<int:application_id>/status/', change_application_status, name='change-application-status'),
    path('organiser/<int:hackathon_id>/stats/', application_stats, name='application-stats'),
]
