# accounts/middleware.py
from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth.models import AnonymousUser
from django.http import JsonResponse
from django.utils import timezone
from .models import SessionActivity
import logging

logger = logging.getLogger(__name__)


class SessionActivityMiddleware(MiddlewareMixin):
    """
    SECURITY FIX #6: Session Activity Middleware
    Tracks user session activity on each authenticated request
    """
    
    def process_request(self, request):
        if request.user and not isinstance(request.user, AnonymousUser):
            try:
                session_activity, created = SessionActivity.objects.get_or_create(
                    user=request.user,
                    defaults={'is_active': True}
                )
                session_activity.last_activity = timezone.now()
                session_activity.is_active = True
                session_activity.save(update_fields=['last_activity', 'is_active'])
            except Exception as e:
                logger.error(f"Error updating session activity: {e}")
        return None


class SessionTimeoutMiddleware(MiddlewareMixin):
    """
    SECURITY FIX #6: Session Timeout Middleware
    Enforces 5-minute session timeout for authenticated users
    """
    
    def process_request(self, request):
        if request.user and not isinstance(request.user, AnonymousUser):
            try:
                session_activity = SessionActivity.objects.get(user=request.user)
                if not session_activity.is_session_valid:
                    session_activity.is_active = False
                    session_activity.save(update_fields=['is_active'])
                    return JsonResponse(
                        {'detail': 'Session expired. Please login again.'},
                        status=401
                    )
            except SessionActivity.DoesNotExist:
                SessionActivity.objects.create(user=request.user, is_active=True)
            except Exception as e:
                logger.error(f"Error validating session timeout: {e}")
        return None
