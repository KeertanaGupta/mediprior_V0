from django.shortcuts import render

# Create your views here.
# core/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserRegistrationSerializer

class UserRegistrationView(APIView):
    """
    Handles POST requests for new user registration.
    """
    def post(self, request):
        # Get the data from the React form
        serializer = UserRegistrationSerializer(data=request.data)
        
        # Validate the data
        if serializer.is_valid():
            # If valid, save the user (this calls our .create() method)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        # If not valid, send back the errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)