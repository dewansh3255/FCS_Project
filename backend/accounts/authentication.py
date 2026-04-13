# accounts/authentication.py
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authentication import SessionAuthentication
from rest_framework.exceptions import PermissionDenied
from django.middleware.csrf import CsrfViewMiddleware
from django.conf import settings

class CookieJWTAuthentication(JWTAuthentication):
    """
    MEMBER A: Custom Cookie Authentication
    Extracts the JWT from the HttpOnly 'access_token' cookie.
    Enforces CSRF to prevent cross-site request forgery attacks.
    """
    def enforce_csrf(self, request):
        # Proper Django CSRF token validation
        # Check for CSRF token in POST data, request body, or X-CSRFToken header
        csrf_middleware = CsrfViewMiddleware(lambda r: None)
        
        if request.method not in ('GET', 'HEAD', 'OPTIONS', 'TRACE'):
            # Check for CSRF token
            csrf_token = request.POST.get('csrfmiddlewaretoken')
            if not csrf_token:
                csrf_token = request.META.get('HTTP_X_CSRFTOKEN')
            if not csrf_token:
                # Try to get from request body (for JSON requests)
                try:
                    import json
                    body = json.loads(request.body)
                    csrf_token = body.get('csrfmiddlewaretoken')
                except:
                    pass
            
            if not csrf_token:
                raise PermissionDenied("CSRF token missing or invalid.")
            
            # Validate the token
            csrf_middleware.process_request(request)
            try:
                csrf_middleware.process_view(request, None, (), {})
            except PermissionDenied:
                raise PermissionDenied("CSRF token validation failed.")

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
                # CRITICAL FIX: Only enforce CSRF for authenticated requests with cookies
                # Registration/Login don't have cookies yet, so they don't need CSRF check here
                self.enforce_csrf(request)
                return user, validated_token
            except PermissionDenied as e:
                raise e
            except Exception:
                # Token might be expired or invalid
                return None

        # No token found - request is unauthenticated, CSRF not required yet
        return None