# core/admin.py
from django.contrib import admin
from .models import User, PatientProfile, DoctorProfile, DoctorPatientConnection, MedicalReport

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'user_type', 'is_admin')
    list_filter = ('user_type', 'is_admin')

@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    list_display = ('name', 'user_email', 'dob', 'phone_number')
    search_fields = ('name', 'user__email')
    
    @admin.display(description='Email')
    def user_email(self, obj):
        return obj.user.email

@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'user_email', 'specialization',
        'medical_registration_number', 'verification_status'
    )
    search_fields = ('name', 'user__email', 'medical_registration_number')
    list_filter = ('verification_status', 'specialization')
    list_editable = ('verification_status',)
    
    @admin.display(description='Email')
    def user_email(self, obj):
        return obj.user.email

# --- ADD THESE TWO LINES ---
admin.site.register(MedicalReport)
admin.site.register(DoctorPatientConnection)