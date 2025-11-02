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
    age = models.IntegerField(null=True, blank=True)
    height = models.FloatField(null=True, blank=True)
    weight = models.FloatField(null=True, blank=True)
    medical_history = models.TextField(blank=True)

    def __str__(self):
        return self.name

class DoctorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, related_name='doctor_profile')
    name = models.CharField(max_length=255)
    specialization = models.CharField(max_length=255)
    years_of_experience = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return self.name