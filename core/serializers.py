# core/serializers.py
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from .models import User, PatientProfile, DoctorProfile, MedicalReport, DoctorPatientConnection

# --- Serializer for Custom Token (adds user_type) ---
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
            'profile_photo', 'bio',
            'verification_status'
        )
        read_only_fields = ('verification_status',)

# --- Serializer for Medical Reports ---
class MedicalReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalReport
        fields = ('id', 'title', 'file', 'uploaded_at')
        read_only_fields = ('uploaded_at',)

# --- Serializer for Public Doctor List ---
class DoctorPublicProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    # This field gets its value from the 'get_connection_status' method
    connection_status = serializers.SerializerMethodField()

    class Meta:
        model = DoctorProfile
        # --- THIS IS THE FIX ---
        # 'connection_status' has been added to this list
        fields = (
            'user_id', 'name', 'email', 'specialization', 'qualification', 
            'years_of_experience', 'clinic_name', 'profile_photo', 'bio',
            'connection_status' 
        )
    
    def get_connection_status(self, obj):
        """
        Checks if the currently logged-in patient has a connection
        with this doctor (obj).
        """
        doctor = obj.user 
        patient = self.context['request'].user 
        try:
            connection = DoctorPatientConnection.objects.get(patient=patient, doctor=doctor)
            return connection.status # Returns "PENDING", "ACCEPTED", or "REJECTED"
        except DoctorPatientConnection.DoesNotExist:
            return None # No connection exists

# --- Serializer for Sending a Connection Request ---
class ConnectionRequestSerializer(serializers.Serializer):
    doctor_id = serializers.IntegerField() 

# --- Serializer for Doctor's Connection Inbox ---
class ConnectionListSerializer(serializers.ModelSerializer):
    patient_id = serializers.IntegerField(source='patient.id')
    patient_name = serializers.CharField(source='patient.patient_profile.name', read_only=True)
    patient_email = serializers.EmailField(source='patient.email', read_only=True)

    class Meta:
        model = DoctorPatientConnection
        fields = ('id', 'patient_id', 'patient_name', 'patient_email', 'status', 'created_at')