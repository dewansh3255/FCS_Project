import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from accounts.models import User

try:
    user = User.objects.create_user(
        username="debug_user_1",
        email="debug_user_1@test.com",
        password="password",
        role='CANDIDATE',
        phone_number="555666777"
    )
    print("User created successfully!")
except Exception as e:
    print(f"Exception: {type(e).__name__} - {str(e)}")

