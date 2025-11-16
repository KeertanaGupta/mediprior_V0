# core/serializers.py
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from .models import User, PatientProfile, DoctorProfile, MedicalReport, DoctorPatientConnection, PatientHealthMetric, Appointment
from django.utils import timezone

# --- Serializer for Custom Token (adds user_type) ---
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['user_type'] = user.user_type
        token['email'] = user.email
        token['user_id'] = user.id  # <-- THIS IS THE FIX
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
        fields = ('name', 'dob', 'gender', 'blood_group', 'phone_number', 'height', 'weight', 'medical_history', 'profile_photo')
        extra_kwargs = {
            'profile_photo': {'required': False},
        }

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

# --- Serializer for Public Doctor List (with Connection Status) ---
class DoctorPublicProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    connection_status = serializers.SerializerMethodField()

    class Meta:
        model = DoctorProfile
        fields = (
            'user_id', 'name', 'email', 'specialization', 'qualification', 
            'years_of_experience', 'clinic_name', 'profile_photo', 'bio',
            'connection_status'
        )

    def get_connection_status(self, obj):
        if 'request' not in self.context or self.context['request'] is None:
            return None
        doctor_user = obj.user
        patient_user = self.context['request'].user
        
        if doctor_user == patient_user:
            return "SELF" 
            
        try:
            connection = DoctorPatientConnection.objects.get(
                patient=patient_user, 
                doctor=doctor_user
            )
            return connection.status
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

# --- Serializer for "My Connections" page ---
class ConnectionListSerializer(serializers.ModelSerializer):
    patient_profile = PatientProfileSerializer(source='patient.patient_profile', read_only=True)
    # The 'context' override is REMOVED. It will now inherit the context
    # from the view, which fixes the crash.
    doctor_profile = DoctorPublicProfileSerializer(source='doctor.doctor_profile', read_only=True) 

    class Meta:
        model = DoctorPatientConnection
        fields = ('id', 'patient_profile', 'doctor_profile', 'status', 'created_at')

# --- Serializer for Patient Health Metrics ---
class PatientHealthMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientHealthMetric
        fields = [
            'id', 'recorded_at', 'heart_rate_bpm', 
            'blood_pressure_systolic', 'blood_pressure_diastolic',
            'blood_count', 'glucose_level_mg_dl', 'sleep_hours', 
            'steps_taken', 'mood', 'symptoms'
        ]
        read_only_fields = ('id', 'recorded_at')
        
# --- NEW: Serializer for a Doctor to CREATE a time slot ---
class AppointmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        # Doctor only needs to provide the start and end time
        fields = ('start_time', 'end_time', 'consultation_type')

    def validate(self, data):
        # A doctor can't create an appointment in the past
        if data['start_time'] < timezone.now():
            raise serializers.ValidationError("Cannot create appointment in the past.")
        # A doctor can't create a slot that ends before it starts
        if data['end_time'] <= data['start_time']:
            raise serializers.ValidationError("End time must be after start time.")
        return data

# --- NEW: Serializer for LISTING/BOOKING appointments ---
class AppointmentSerializer(serializers.ModelSerializer):
    # We'll show the patient's and doctor's name
    patient_name = serializers.CharField(source='patient.patient_profile.name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.doctor_profile.name', read_only=True)

    class Meta:
        model = Appointment
        fields = (
            'id', 'doctor', 'doctor_name', 'patient', 'patient_name', 
            'start_time', 'end_time', 'status', 'consultation_type',
            'notes', 'prescription'
        )
        # A patient can't change these fields when booking
        read_only_fields = (
            'doctor', 'doctor_name', 'patient_name', 'start_time', 'end_time',
            'notes', 'prescription'
        )