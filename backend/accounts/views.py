from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny # <--- IMPORT THIS
from .models import UserKeys
from .serializers import UserRegistrationSerializer, UserKeysSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserRegistrationSerializer

# accounts/views.py

class UploadKeysView(APIView):
    """
    MEMBER B: Key Upload Endpoint
    Allows the frontend to save generated keys to the database.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        # --- MOCK USER STRATEGY (Until Feb 20) ---
        user, created = User.objects.get_or_create(username="mock_user_1")
        if created:
            user.set_password("TestPass123")
            user.phone_number = "0000000000"
            user.save()
        # -----------------------------------------

        # --- ATOMIC FIX FOR RACE CONDITIONS ---
        # update_or_create handles the "Does it exist? Update it. If not, Create it" logic
        # safely in one step, preventing the IntegrityError.
        
        keys, created = UserKeys.objects.update_or_create(
            user=user,
            defaults={
                'public_key': request.data.get('public_key'),
                'encrypted_private_key': request.data.get('encrypted_private_key')
            }
        )
        
        return Response(
            {"message": "Keys updated successfully!" if not created else "Keys created successfully!"}, 
            status=status.HTTP_200_OK  # 200 OK is safer than 201 for updates
        )