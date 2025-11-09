# core/urls.py
from django.urls import path
from .views import (
    UserRegistrationView, 
    ProfileView, 
    MedicalReportView,
    MedicalReportDetailView,
    VerifiedDoctorListView,
    ConnectionRequestView,
    DoctorConnectionView,        # <-- NEW
    PatientConnectionDetailView  # <-- NEW
)

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('reports/', MedicalReportView.as_view(), name='reports'),
    path('reports/<int:pk>/', MedicalReportDetailView.as_view(), name='report-detail'),
    
    # "Find Doctors" page
    path('doctors/', VerifiedDoctorListView.as_view(), name='doctor-list'),
    
    # "Send" button
    path('connections/send/', ConnectionRequestView.as_view(), name='connection-send'),
    
    # "My Connections" page (GET, POST for accept/reject)
    path('connections/', DoctorConnectionView.as_view(), name='connection-list'),
    
    # "Remove" button
    path('connections/<int:doctor_id>/', PatientConnectionDetailView.as_view(), name='connection-detail'),
]