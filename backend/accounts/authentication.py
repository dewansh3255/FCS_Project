# accounts/authentication.py
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authentication import SessionAuthentication
from rest_framework.exceptions import PermissionDenied

class CookieJWTAuthentication(JWTAuthentication):
    """
    MEMBER A: Custom Cookie Authentication
    Extracts the JWT from the HttpOnly 'access_token' cookie.
    Enforces CSRF to prevent cross-site request forgery attacks.
    """
    def enforce_csrf(self, request):
        # Anti-CSRF protection: Require explicit custom header for state-changing methods
        if request.method not in ('GET', 'HEAD', 'OPTIONS', 'TRACE'):
            if request.headers.get('X-Requested-With') != 'XMLHttpRequest':
                raise PermissionDenied("CSRF Failed: X-Requested-With header missing or invalid.")

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
                user = self.get_user(validated_token)
                self.enforce_csrf(request)
                return user, validated_token
            except PermissionDenied as e:
                raise e
            except Exception:
                # Token might be expired or invalid
                return None

        return None