# accounts/authentication.py
from rest_framework_simplejwt.authentication import JWTAuthentication

class CookieJWTAuthentication(JWTAuthentication):
    """
    MEMBER A: Custom Cookie Authentication
    Extracts the JWT from the HttpOnly 'access_token' cookie.
    """
    def authenticate(self, request):
        # 1. First, check the standard Authorization header (good for testing)
        header = self.get_header(request)
        if header is not None:
            return super().authenticate(request)

        # 2. If no header, extract the token from the HttpOnly cookie
        raw_token = request.COOKIES.get('access_token')
        if raw_token is not None:
            try:
                validated_token = self.get_validated_token(raw_token)
                return self.get_user(validated_token), validated_token
            except Exception:
                # Token might be expired or invalid
                return None

        return None