# core/urls.py
from django.urls import path
from .views import (
    UserRegistrationView, 
    ProfileView, 
    MedicalReportView,
    MedicalReportDetailView,
    VerifiedDoctorListView,
    ConnectionRequestView,
    DoctorConnectionView,        
    PatientConnectionDetailView, 
    PatientHealthMetricView
)

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('reports/', MedicalReportView.as_view(), name='reports'),
    path('reports/<int:pk>/', MedicalReportDetailView.as_view(), name='report-detail'),
    
    path('doctors/', VerifiedDoctorListView.as_view(), name='doctor-list'),
    
    path('connections/send/', ConnectionRequestView.as_view(), name='connection-send'),
    path('connections/', DoctorConnectionView.as_view(), name='connection-list'),
    path('connections/<int:doctor_id>/', PatientConnectionDetailView.as_view(), name='connection-detail'),
    
    path('health-metrics/', PatientHealthMetricView.as_view(), name='health-metrics'),
]