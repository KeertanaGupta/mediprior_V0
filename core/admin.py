from django.contrib import admin

# Register your models here.
from .models import User, PatientProfile, DoctorProfile

# Register your models here so they show up in the admin panel.
admin.site.register(User)
admin.site.register(PatientProfile)
admin.site.register(DoctorProfile)