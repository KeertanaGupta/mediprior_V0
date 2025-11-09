# core/serializers.py
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from .models import User, PatientProfile, DoctorProfile, MedicalReport, DoctorPatientConnection

# --- Serializer for Custom Token ---
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
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
        user = User.objects.create_user(**validated_data)
        return user

# --- Serializer for Patient Profile ---
class PatientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientProfile
        fields = ('name', 'dob', 'gender', 'blood_group', 'phone_number', 'height', 'weight', 'medical_history')

# --- Serializer for Doctor Profile ---
class DoctorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorProfile
        fields = (
            'name', 'phone_number', 'dob', 'gender',
            'medical_registration_number', 'medical_council',
            'qualification', 'specialization', 'years_of_experience',
            'clinic_name', 'consultation_type',
            'medical_degree_certificate', 'medical_registration_certificate',
            'profile_photo', 'bio', 'verification_status'
        )
        read_only_fields = ('verification_status',)
        
        # --- THIS IS THE FIX ---
        # Make file fields optional on updates.
        extra_kwargs = {
            'medical_degree_certificate': {'required': False},
            'medical_registration_certificate': {'required': False},
            'profile_photo': {'required': False},
        }

# --- Serializer for Medical Reports ---
class MedicalReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalReport
        fields = ('id', 'title', 'file', 'uploaded_at')
        read_only_fields = ('uploaded_at',)

# --- Serializer for Public Doctor List (FIXED) ---
class DoctorPublicProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    connection_status = serializers.SerializerMethodField()

    class Meta:
        model = DoctorProfile
        fields = (
            'user_id', 'name', 'email', 'specialization', 'qualification', 
            'years_of_experience', 'clinic_name', 'profile_photo', 'bio',
            'connection_status' # <-- This field was missing
        )

    def get_connection_status(self, obj):
        doctor_user = obj.user
        patient_user = self.context['request'].user
        
        if doctor_user == patient_user:
            return "SELF" # Fix for doctor seeing themself
            
        try:
            connection = DoctorPatientConnection.objects.get(
                patient=patient_user, 
                doctor=doctor_user
            )
            return connection.status # Return "PENDING" or "ACCEPTED"
        except DoctorPatientConnection.DoesNotExist:
            return None

# --- Serializer for Sending Connection Request ---
class ConnectionRequestSerializer(serializers.Serializer):
    doctor_id = serializers.IntegerField()

    def validate(self, data):
        doctor_id = data.get('doctor_id')
        patient = self.context['request'].user
        
        try:
            doctor_user = User.objects.get(
                id=doctor_id, 
                user_type=User.UserType.DOCTOR, 
                doctor_profile__verification_status=DoctorProfile.VerificationStatus.VERIFIED
            )
        except User.DoesNotExist:
            raise serializers.ValidationError("No verified doctor found with this ID.")
        
        if patient == doctor_user:
            raise serializers.ValidationError("You cannot connect with yourself.")
            
        connection_exists = DoctorPatientConnection.objects.filter(patient=patient, doctor=doctor_user, status__in=['PENDING', 'ACCEPTED']).exists()
        if connection_exists:
            raise serializers.ValidationError("A connection request already exists or is accepted.")
            
        data['doctor_user'] = doctor_user
        return data

    def create(self, validated_data):
        patient = self.context['request'].user
        doctor_user = validated_data['doctor_user']
        
        connection, created = DoctorPatientConnection.objects.get_or_create(
            patient=patient,
            doctor=doctor_user,
            defaults={'status': DoctorPatientConnection.ConnectionStatus.PENDING}
        )
        
        if not created and connection.status == 'REJECTED':
             connection.status = DoctorPatientConnection.ConnectionStatus.PENDING
             connection.save()
            
        return connection

# --- NEW: Serializer for "My Connections" page ---
class ConnectionListSerializer(serializers.ModelSerializer):
    patient_profile = PatientProfileSerializer(source='patient.patient_profile', read_only=True)
    doctor_profile = DoctorPublicProfileSerializer(source='doctor.doctor_profile', read_only=True, context={'request': None}) # Pass None context

    class Meta:
        model = DoctorPatientConnection
        fields = ('id', 'patient_profile', 'doctor_profile', 'status', 'created_at')