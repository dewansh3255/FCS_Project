from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

# Import all our custom views
from .views import (
    RegisterView, 
    CustomLoginView, 
    UploadKeysView, 
    GenerateTOTPURIView, 
    VerifyTOTPView,
    ProfileRetrieveUpdateView
)

urlpatterns = [
    # Core Auth
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomLoginView.as_view(), name='login'), # Replaced the default JWT login
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # TOTP & 2FA
    path('totp/generate/<int:user_id>/', GenerateTOTPURIView.as_view(), name='generate_totp'),
    path('totp/verify/', VerifyTOTPView.as_view(), name='verify_totp'),
    
    # E2EE Crypto
    path('keys/upload/', UploadKeysView.as_view(), name='upload_keys'),
    
    # Profiles
    path('profile/me/', ProfileRetrieveUpdateView.as_view(), name='my_profile'),
    path('profile/<str:username>/', ProfileRetrieveUpdateView.as_view(), name='user_profile'),
]