# core/serializers.py
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from .models import User, PatientProfile, DoctorProfile

# --- Serializer for Custom Token (adds user_type) ---
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['user_type'] = user.user_type
        token['email'] = user.email
        return token

# --- Serializer for User Registration ---
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ('email', 'password', 'user_type')

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            user_type=validated_data['user_type']
        )
        return user

# --- Serializer for Patient Profile ---
class PatientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientProfile
        fields = (
            'name', 'dob', 'gender', 'blood_group', 'phone_number',
            'height', 'weight', 'medical_history'
        )

# --- Serializer for Doctor Profile (The new, correct one) ---
class DoctorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorProfile
        fields = (
            'name', 'phone_number', 'dob', 'gender',
            'medical_registration_number', 'medical_council',
            'qualification', 'specialization', 'years_of_experience',
            'clinic_name', 'consultation_type',
            'medical_degree_certificate', 'medical_registration_certificate',
            'profile_photo', 'bio',
            'verification_status' # We include this so the app knows the status
        )
        # Make status read-only. Only an Admin can change this.
        read_only_fields = ('verification_status',)