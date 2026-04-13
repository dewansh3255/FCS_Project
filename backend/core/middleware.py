"""
Custom middleware to properly disable CSRF for specific endpoints.
This must run BEFORE CsrfViewMiddleware.
"""
import logging

logger = logging.getLogger(__name__)

class CsrfExemptionMiddleware:
    """
    Middleware to disable CSRF protection for specific API endpoints.
    Sets request.csrf_processing_done = True to prevent CsrfViewMiddleware from checking CSRF.
    
    These endpoints don't require CSRF tokens because:
    1. Public auth endpoints (register, login) - no session yet
    2. Token endpoints - using JWT, not sessions
    3. API endpoints - using token auth, not cookies
    """
    
    # All /api/ endpoints are exempted because we use JWT auth (not cookies)
    # CSRF is only needed for cookie-based auth
    EXEMPT_PREFIXES = [
        '/api/',
    ]
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # For all API endpoints, disable CSRF checking since we use JWT auth
        for prefix in self.EXEMPT_PREFIXES:
            if request.path.startswith(prefix):
                request.csrf_processing_done = True
                break
        
        response = self.get_response(request)
        return response
