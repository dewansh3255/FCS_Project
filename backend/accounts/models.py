from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

class User(AbstractUser):
    class Roles(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        RECRUITER = 'RECRUITER', 'Recruiter'
        CANDIDATE = 'CANDIDATE', 'Candidate'

    role = models.CharField(max_length=20, choices=Roles.choices, default=Roles.CANDIDATE)
    phone_number = models.CharField(max_length=15, unique=True, null=True, blank=True)
    is_verified = models.BooleanField(default=False)  # For OTP verification

    def __str__(self):
        return self.username

class UserKeys(models.Model):
    """
    MEMBER B: UserKeys Model
    Stores the user's RSA Public Key and Encrypted Private Key.
    """
    # Use settings.AUTH_USER_MODEL to correctly reference your custom User
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='keys')
    public_key = models.TextField(help_text="RSA Public Key (SPKI format)")
    encrypted_private_key = models.TextField(help_text="AES Encrypted Private Key")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Keys for {self.user.username}"