from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    class Roles(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        RECRUITER = 'RECRUITER', 'Recruiter'
        CANDIDATE = 'CANDIDATE', 'Candidate'

    role = models.CharField(max_length=20, choices=Roles.choices, default=Roles.CANDIDATE)
    phone_number = models.CharField(max_length=15, unique=True, null=True, blank=True)
    is_verified = models.BooleanField(default=False)  # For OTP verification
    
    # We will add encryption keys here later for Member B
    
    def __str__(self):
        return self.username