from django.db import models

# Create your models here.
# core/models.py
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

# --- Manager for our Custom User ---
# This class tells Django how to create users and superusers
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
# This is our main User table. It only stores login info.
class User(AbstractBaseUser):
    class UserType(models.TextChoices):
        PATIENT = 'PATIENT', 'Patient'
        DOCTOR = 'DOCTOR', 'Doctor'

    email = models.EmailField(verbose_name='email address', max_length=255, unique=True)
    user_type = models.CharField(max_length=50, choices=UserType.choices)
    
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False) # For superuser

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['user_type'] # email and password are required by default.

    def __str__(self):
        return self.email

    def has_perm(self, perm, obj=None):
        "Does the user have a specific permission?"
        return True

    def has_module_perms(self, app_label):
        "Does the user have permissions to view the app `app_label`?"
        return True

    @property
    def is_staff(self):
        "Is the user a member of staff?"
        return self.is_admin

# --- Profile Models ---
# These models store the extra details. They are linked to the main User.
class PatientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, related_name='patient_profile')
    name = models.CharField(max_length=255)
    
    # --- NEW & UPDATED FIELDS ---
    dob = models.DateField(null=True, blank=True) # Replaces 'age'
    gender = models.CharField(max_length=10, blank=True)
    blood_group = models.CharField(max_length=5, blank=True)
    phone_number = models.CharField(max_length=15, blank=True)
    
    height = models.FloatField(null=True, blank=True)
    weight = models.FloatField(null=True, blank=True)
    medical_history = models.TextField(blank=True)
    # --- END OF CHANGES ---

    def __str__(self):
        return self.name


# core/models.py
# ... (User, UserManager, and PatientProfile classes are above) ...

class DoctorProfile(models.Model):
    # Verification Status Choices
    class VerificationStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending Review'
        VERIFIED = 'VERIFIED', 'Verified'
        REJECTED = 'REJECTED', 'Rejected'

    # Consultation Type Choices
    class ConsultationType(models.TextChoices):
        ONLINE = 'ONLINE', 'Online'
        IN_PERSON = 'IN_PERSON', 'In-Person'
        BOTH = 'BOTH', 'Both'

    # --- Basic Details ---
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, related_name='doctor_profile')
    name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=15, blank=True)
    dob = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, blank=True)
    
    # --- Professional Details (NOW WITH blank=True/null=True) ---
    medical_registration_number = models.CharField(max_length=100, unique=True, null=True, blank=True)
    medical_council = models.CharField(max_length=255, blank=True)
    qualification = models.CharField(max_length=255, blank=True)
    specialization = models.CharField(max_length=255, blank=True)
    years_of_experience = models.PositiveIntegerField(null=True, blank=True)
    clinic_name = models.CharField(max_length=255, blank=True)
    consultation_type = models.CharField(max_length=20, choices=ConsultationType.choices, default=ConsultationType.BOTH)

    # --- Verification Documents ---
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

    # --- THE VERIFICATION FIELD ---
    verification_status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING
    )

    def __str__(self):
        return f"Dr. {self.name} ({self.verification_status})"