# core/serializers.py
from rest_framework import serializers
from .models import User

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    """
    # We make 'password' write-only so it's never sent back in a response
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ('email', 'password', 'user_type') # Fields we expect from React

    def create(self, validated_data):
        # We use our custom user manager's 'create_user' method
        # This automatically handles password hashing and user_type normalization
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            user_type=validated_data['user_type']
        )
        return user