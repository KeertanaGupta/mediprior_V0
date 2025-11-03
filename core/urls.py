# core/urls.py
from django.urls import path
from .views import UserRegistrationView, ProfileView

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('profile/', ProfileView.as_view(), name='profile'),
]