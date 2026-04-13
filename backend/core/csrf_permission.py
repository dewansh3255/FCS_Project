"""
Custom CSRF permission class for DRF that properly handles CSRF exemption.
"""
from rest_framework.permissions import BasePermission
from django.middleware.csrf import CsrfViewMiddleware
from django.views.decorators.csrf import csrf_exempt

class CsrfExemptPermission(BasePermission):
    """
    Permission class that exempts a view from CSRF protection.
    Use this instead of @csrf_exempt for DRF views.
    """
    def has_permission(self, request, view):
        return True


def disable_csrf_for_view(view_class):
    """
    Decorator to disable CSRF protection for a DRF view class.
    
    Usage:
    @disable_csrf_for_view
    class MyView(APIView):
        pass
    """
    original_dispatch = view_class.dispatch
    
    def csrf_exempt_dispatch(self, *args, **kwargs):
        return original_dispatch(self, *args, **kwargs)
    
    csrf_exempt_dispatch = csrf_exempt(csrf_exempt_dispatch)
    view_class.dispatch = csrf_exempt_dispatch
    return view_class
