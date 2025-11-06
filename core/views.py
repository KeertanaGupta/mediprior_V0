# core/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser # Added JSONParser
from django.http import Http404

# Import all your models
from .models import (
    PatientProfile, 
    DoctorProfile, 
    MedicalReport, 
    User,
    DoctorPatientConnection # <-- Added this
)

# Import all your serializers
from .serializers import (
    UserRegistrationSerializer, 
    PatientProfileSerializer, 
    DoctorProfileSerializer, 
    MyTokenObtainPairSerializer,
    MedicalReportSerializer,
    DoctorPublicProfileSerializer, # <-- Added this
    ConnectionRequestSerializer,
    ConnectionListSerializer
)

class UserRegistrationView(APIView):
    """
    Handles POST requests for new user registration.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(APIView):
    """
    Handles fetching and creating/updating user profiles.
    Supports multipart/form-data AND json.
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser, JSONParser) # Now supports JSON

    def get(self, request):
        """
        Fetch the user's profile based on their user_type.
        """
        user = request.user
        try:
            if user.user_type == 'PATIENT':
                profile = PatientProfile.objects.get(user=user)
                serializer = PatientProfileSerializer(profile)
            elif user.user_type == 'DOCTOR':
                profile = DoctorProfile.objects.get(user=user)
                serializer = DoctorProfileSerializer(profile)
            else:
                return Response({"error": "No profile found for this user type"}, status=status.HTTP_404_NOT_FOUND)
            
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except (PatientProfile.DoesNotExist, DoctorProfile.DoesNotExist):
            return Response({"message": "Profile not yet created"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        """
        Create or update a user's profile.
        """
        user = request.user
        
        if user.user_type == 'PATIENT':
            profile, created = PatientProfile.objects.get_or_create(user=user)
            serializer = PatientProfileSerializer(instance=profile, data=request.data, partial=True)
        
        elif user.user_type == 'DOCTOR':
            profile, created = DoctorProfile.objects.get_or_create(user=user)
            serializer = DoctorProfileSerializer(instance=profile, data=request.data, partial=True)
        
        else:
            return Response({"error": "Invalid user type"}, status=status.HTTP_400_BAD_REQUEST)

        if serializer.is_valid():
            serializer.save(user=user) 
            return Response(serializer.data, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MedicalReportView(APIView):
    """
    Handle listing and uploading medical reports for the logged-in patient.
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser) 

    def get(self, request):
        reports = MedicalReport.objects.filter(patient=request.user)
        serializer = MedicalReportSerializer(reports, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = MedicalReportSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(patient=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MedicalReportDetailView(APIView):
    """
    Retrieve or delete a medical report instance.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        """
        Helper method to get a report, but only if the user owns it.
        """
        try:
            return MedicalReport.objects.get(pk=pk, patient=user)
        except MedicalReport.DoesNotExist:
            raise Http404

    def delete(self, request, pk, format=None):
        """
        Delete a report.
        """
        report = self.get_object(pk, request.user)
        report.file.delete(save=False) 
        report.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


# --- THIS IS ONE OF THE MISSING CLASSES ---
class VerifiedDoctorListView(APIView):
    """
    Provides a public list of all *VERIFIED* doctors
    for patients to browse and connect with.
    """
    permission_classes = [permissions.IsAuthenticated] 

    def get(self, request):
        verified_profiles = DoctorProfile.objects.filter(
            verification_status=DoctorProfile.VerificationStatus.VERIFIED
        )
        
        # --- THIS LINE IS UPDATED ---
        # We pass the request context so the serializer knows who the patient is.
        serializer = DoctorPublicProfileSerializer(
            verified_profiles, 
            many=True, 
            context={'request': request} # <-- ADD THIS
        )
        
        return Response(serializer.data, status=status.HTTP_200_OK)
class ConnectionRequestView(APIView):
    """
    Allow a Patient to send a connection request to a Doctor.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ConnectionRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        doctor_id = serializer.validated_data['doctor_id']
        patient = request.user

        if patient.user_type != User.UserType.PATIENT:
            return Response(
                {"error": "Only patients can send connection requests."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            doctor = User.objects.get(id=doctor_id, user_type=User.UserType.DOCTOR)
        except User.DoesNotExist:
            return Response({"error": "Doctor not found."}, status=status.HTTP_404_NOT_FOUND)

        connection, created = DoctorPatientConnection.objects.get_or_create(
            patient=patient,
            doctor=doctor
        )

        if not created:
            return Response(
                {"message": f"A connection request is already pending or accepted for Dr. {doctor.doctor_profile.name}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {"message": f"Connection request sent to {doctor.doctor_profile.name}."},
            status=status.HTTP_201_CREATED
        )
        
# core/views.py
# ... (all your other views are above) ...

class DoctorConnectionView(APIView):
    """
    Allows a Doctor to manage their connection requests.
    GET: List all pending requests.
    POST: Accept or reject a request.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """
        Return a list of all PENDING connection requests for this doctor.
        """
        # Ensure the user is a doctor
        if request.user.user_type != User.UserType.DOCTOR:
            return Response(
                {"error": "Only doctors can view connection requests."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        pending_connections = DoctorPatientConnection.objects.filter(
            doctor=request.user,
            status=DoctorPatientConnection.ConnectionStatus.PENDING
        )
        
        serializer = ConnectionListSerializer(pending_connections, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """
        Accept or Reject a connection request.
        Expects: { "connection_id": 1, "action": "ACCEPT" or "REJECT" }
        """
        # Ensure the user is a doctor
        if request.user.user_type != User.UserType.DOCTOR:
            return Response(
                {"error": "Only doctors can manage connections."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        connection_id = request.data.get('connection_id')
        action = request.data.get('action').upper()

        if not connection_id or not action:
            return Response(
                {"error": "connection_id and action are required."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Security: Find the connection *and* make sure it belongs to this doctor
            connection = DoctorPatientConnection.objects.get(
                id=connection_id, 
                doctor=request.user
            )
        except DoctorPatientConnection.DoesNotExist:
            return Response({"error": "Connection not found."}, status=status.HTTP_404_NOT_FOUND)

        if action == 'ACCEPT':
            connection.status = DoctorPatientConnection.ConnectionStatus.ACCEPTED
            connection.save()
            return Response({"message": "Connection accepted."}, status=status.HTTP_200_OK)
        
        elif action == 'REJECT':
            connection.status = DoctorPatientConnection.ConnectionStatus.REJECTED
            connection.save()
            return Response({"message": "Connection rejected."}, status=status.HTTP_200_OK)
        
        else:
            return Response({"error": "Invalid action. Must be 'ACCEPT' or 'REJECT'."}, status=status.HTTP_400_BAD_REQUEST)
        
class PatientConnectionDetailView(APIView):
    """
    Allows a Patient to DELETE a connection they have with a doctor.
    """
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, doctor_id, format=None):
        patient = request.user
        
        try:
            # Find the doctor User object
            doctor = User.objects.get(id=doctor_id, user_type=User.UserType.DOCTOR)
        except User.DoesNotExist:
            return Response({"error": "Doctor not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            # Find the connection between the patient and this doctor
            connection = DoctorPatientConnection.objects.get(
                patient=patient,
                doctor=doctor
            )
            # Delete it
            connection.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except DoctorPatientConnection.DoesNotExist:
            # If no connection exists, that's fine, just say it's done
            return Response(status=status.HTTP_204_NO_CONTENT)