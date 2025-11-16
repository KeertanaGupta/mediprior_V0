# core/models.py
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.conf import settings # Used for settings.AUTH_USER_MODEL

# --- Manager for our Custom User ---
class UserManager(BaseUserManager):
    def create_user(self, email, user_type, password=None):
        user_type = user_type.upper() 
        if not email:
            raise ValueError('Users must have an email address')
        if user_type not in ['PATIENT', 'DOCTOR']:
             raise ValueError("Invalid user type: must be 'PATIENT' or 'DOCTOR'")

        user = self.model(
            email=self.normalize_email(email),
            user_type=user_type,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, user_type, password=None):
        user = self.create_user(
            email,
            password=password,
            user_type=user_type,
        )
        user.is_admin = True
        user.save(using=self._db)
        return user

# --- Custom User Model ---
class User(AbstractBaseUser):
    class UserType(models.TextChoices):
        PATIENT = 'PATIENT', 'Patient'
        DOCTOR = 'DOCTOR', 'Doctor'

    email = models.EmailField(verbose_name='email address', max_length=255, unique=True)
    user_type = models.CharField(max_length=50, choices=UserType.choices)
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    objects = UserManager()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['user_type']

    def __str__(self):
        return self.email
    def has_perm(self, perm, obj=None):
        return True
    def has_module_perms(self, app_label):
        return True
    @property
    def is_staff(self):
        return self.is_admin

# --- Patient Profile ---
def get_patient_photo_upload_path(instance, filename):
    return f'patients/{instance.user.email}/photo_{filename}'

class PatientProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, primary_key=True, related_name='patient_profile')
    name = models.CharField(max_length=255)
    dob = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, blank=True)
    blood_group = models.CharField(max_length=5, blank=True)
    phone_number = models.CharField(max_length=15, blank=True)
    height = models.FloatField(null=True, blank=True)
    weight = models.FloatField(null=True, blank=True)
    medical_history = models.TextField(blank=True)
    
    # --- ADD THIS LINE ---
    profile_photo = models.ImageField(upload_to=get_patient_photo_upload_path, null=True, blank=True)

    def __str__(self):
        return self.name

# --- Doctor Profile ---
class DoctorProfile(models.Model):
    class VerificationStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending Review'
        VERIFIED = 'VERIFIED', 'Verified'
        REJECTED = 'REJECTED', 'Rejected'
    class ConsultationType(models.TextChoices):
        ONLINE = 'ONLINE', 'Online'
        IN_PERSON = 'IN_PERSON', 'In-Person'
        BOTH = 'BOTH', 'Both'

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, primary_key=True, related_name='doctor_profile')
    name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=15, blank=True)
    dob = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, blank=True)
    medical_registration_number = models.CharField(max_length=100, unique=True, null=True, blank=True)
    medical_council = models.CharField(max_length=255, blank=True)
    qualification = models.CharField(max_length=255, blank=True)
    specialization = models.CharField(max_length=255, blank=True)
    years_of_experience = models.PositiveIntegerField(null=True, blank=True)
    clinic_name = models.CharField(max_length=255, blank=True)
    consultation_type = models.CharField(max_length=20, choices=ConsultationType.choices, default=ConsultationType.BOTH)
    
    def get_degree_upload_path(instance, filename):
        return f'doctors/{instance.user.email}/degree_{filename}'
    def get_reg_upload_path(instance, filename):
        return f'doctors/{instance.user.email}/registration_{filename}'
    def get_photo_upload_path(instance, filename):
        return f'doctors/{instance.user.email}/photo_{filename}'

    medical_degree_certificate = models.FileField(upload_to=get_degree_upload_path, null=True, blank=True)
    medical_registration_certificate = models.FileField(upload_to=get_reg_upload_path, null=True, blank=True)
    profile_photo = models.ImageField(upload_to=get_photo_upload_path, null=True, blank=True)
    bio = models.TextField(max_length=250, blank=True)
    verification_status = models.CharField(max_length=20, choices=VerificationStatus.choices, default=VerificationStatus.PENDING)

    def __str__(self):
        return f"Dr. {self.name} ({self.verification_status})"

# --- Medical Report ---
def get_report_upload_path(instance, filename):
    return f'patients/{instance.patient.email}/reports/{filename}'

class MedicalReport(models.Model):
    patient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reports')
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to=get_report_upload_path)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report '{self.title}' for {self.patient.email}"

# --- Doctor-Patient Connection ---
class DoctorPatientConnection(models.Model):
    class ConnectionStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        ACCEPTED = 'ACCEPTED', 'Accepted'
        REJECTED = 'REJECTED', 'Rejected'
    
    patient = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='doctor_connections',
        limit_choices_to={'user_type': User.UserType.PATIENT}
    )
    
    doctor = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='patient_connections',
        limit_choices_to={'user_type': User.UserType.DOCTOR}
    )
    
    status = models.CharField(
        max_length=10, 
        choices=ConnectionStatus.choices, 
        default=ConnectionStatus.PENDING
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('patient', 'doctor')

    def __str__(self):
        return f"{self.patient.email} -> {self.doctor.email} ({self.status})"

# --- NEW: Patient Health Metrics ---
class PatientHealthMetric(models.Model):
    # Link to the Patient Profile, not the User, for clarity
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='health_metrics')
    
    # Core Vitals
    recorded_at = models.DateTimeField(auto_now_add=True)
    heart_rate_bpm = models.IntegerField(blank=True, null=True) # Heart Rate
    blood_pressure_systolic = models.IntegerField(blank=True, null=True) # e.g., 120
    blood_pressure_diastolic = models.IntegerField(blank=True, null=True) # e.g., 80
    blood_count = models.FloatField(blank=True, null=True) # e.g., 80-90
    glucose_level_mg_dl = models.FloatField(blank=True, null=True) # e.g., 230
    
    # Other metrics from your plan
    sleep_hours = models.FloatField(blank=True, null=True)
    steps_taken = models.IntegerField(blank=True, null=True)
    mood = models.CharField(max_length=50, blank=True)
    symptoms = models.TextField(blank=True)

    class Meta:
        ordering = ['-recorded_at'] # Show the most recent metrics first

    def __str__(self):
        return f"Health Metrics for {self.patient.name} ({self.recorded_at.strftime('%Y-%m-%d')})"
    
# --- NEW: Appointment System ---
class Appointment(models.Model):
    class AppointmentStatus(models.TextChoices):
        AVAILABLE = 'AVAILABLE', 'Available'
        BOOKED = 'BOOKED', 'Booked'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELED = 'CANCELED', 'Canceled'

    class ConsultationType(models.TextChoices):
        ONLINE = 'ONLINE', 'Online'
        IN_PERSON = 'IN_PERSON', 'In-Person'

    # The doctor who set this availability
    doctor = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='doctor_appointments',
        limit_choices_to={'user_type': User.UserType.DOCTOR}
    )
    
    # The patient who booked this.
    # This is NULL if the slot is still 'AVAILABLE'.
    patient = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        related_name='patient_appointments',
        limit_choices_to={'user_type': User.UserType.PATIENT},
        null=True, 
        blank=True
    )
    
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    
    status = models.CharField(
        max_length=20,
        choices=AppointmentStatus.choices,
        default=AppointmentStatus.AVAILABLE
    )
    
    consultation_type = models.CharField(
        max_length=20,
        choices=ConsultationType.choices,
        default=ConsultationType.IN_PERSON
    )
    
    # These are for after the appointment
    notes = models.TextField(blank=True) # Doctor's private notes
    prescription = models.TextField(blank=True) # Patient-visible prescription

    class Meta:
        ordering = ['start_time']
        # A doctor cannot have two appointments at the exact same time
        unique_together = ('doctor', 'start_time')

    def __str__(self):
        if self.patient:
            return f"Appt for {self.patient.email} with Dr. {self.doctor.doctor_profile.name} at {self.start_time}"
        return f"Available slot for Dr. {self.doctor.doctor_profile.name} at {self.start_time}"
    
# --- NEW: Chat System Models ---

class Conversation(models.Model):
    """
    A conversation between two or more users.
    We will start with 1-on-1 between a patient and a doctor.
    """
    # We use a ManyToManyField so you can add more people later
    # (e.g., a patient, a doctor, and a specialist)
    participants = models.ManyToManyField(User, related_name='conversations')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Conversation {self.id}"


class Message(models.Model):
    """
    A single message within a conversation.
    """
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp'] # Show oldest messages first

    def __str__(self):
        return f"Message from {self.sender.email} at {self.timestamp.strftime('%Y-%m-%d %H:%M')}"