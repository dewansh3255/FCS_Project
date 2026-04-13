# CSRF Token Validation Issue - RESOLVED ✅

## Problem Statement
Users were experiencing CSRF token validation errors when attempting to:
1. **Register** - "CSRF token missing or invalid" (403 Forbidden)
2. **Login** - Intermittent login failures for some accounts with CSRF errors

The error appeared in Django logs as:
```
API Error 403: {'detail': ErrorDetail(string='CSRF token missing or invalid.')}
Forbidden: /api/auth/register/
[13/Apr/2026 16:16:27] "POST /api/auth/register/ HTTP/1.0" 403 43
```

## Root Cause - Three Interconnected Issues

### 1. **HTTP/1.0 Protocol in Nginx** ⚠️
- Nginx was proxying requests using HTTP/1.0 instead of HTTP/1.1
- HTTP/1.0 has different header handling that causes cookie transmission issues
- Evidence: Backend logs showed `HTTP/1.0` instead of `HTTP/1.1`

### 2. **Overly Strict CSRF Cookie Security** 🔒
- Django settings had `CSRF_COOKIE_SECURE = True` globally
- This prevented cookies from being sent over HTTP (development mode)
- Frontend couldn't read CSRF token from cookies

### 3. **Missing CSRF Token Pre-fetch** 📝
- Frontend was making POST requests without first ensuring CSRF token was set
- Django's middleware would reject requests without the token cookie

## Solutions Implemented

### Solution 1: Fix Nginx HTTP Protocol Version
**File**: `/nginx/nginx.conf`

**Changes**: Added `proxy_http_version 1.1;` to all upstream connections

```nginx
location /api/ {
    proxy_pass http://backend:8000;
    proxy_http_version 1.1;  # <-- ADDED
    proxy_set_header Host $host;
    # ... other headers ...
}
```

**Applied to**:
- `/portal-206-987-secure/` endpoint
- `/static/` endpoint
- `/media/` endpoint
- `/api/` endpoint
- `/` (frontend) endpoint

**Impact**: All requests now use HTTP/1.1 with proper header handling

---

### Solution 2: Environment-Aware CSRF Cookie Security
**File**: `/backend/core/settings.py`

**Changes**: Made security settings respect DEBUG mode

```python
# Development: Allow cookies over HTTP
# Production: Require HTTPS for cookies
CSRF_COOKIE_SECURE = False if DEBUG else True
SESSION_COOKIE_SECURE = False if DEBUG else True

# Development: Use current domain automatically  
# Production: Use explicit domain from environment
CSRF_COOKIE_DOMAIN = None if DEBUG else os.environ.get('CSRF_COOKIE_DOMAIN')
SESSION_COOKIE_DOMAIN = None if DEBUG else os.environ.get('SESSION_COOKIE_DOMAIN')
```

**Benefits**:
- ✅ Development works over HTTP
- ✅ Production still uses HTTPS-only cookies for security
- ✅ Automatic domain detection in development

**Removed**: Problematic `proxy_cookie_flags ~ secure httponly samesite=Lax;` from nginx

---

### Solution 3: Frontend CSRF Token Pre-fetch
**File**: `/frontend/src/services/api.ts`

**Added Function**: `ensureCsrfToken()`
```typescript
export const ensureCsrfToken = async (): Promise<void> => {
  if (csrfFetchPromise) return csrfFetchPromise;
  if (getCsrfTokenFromCookie()) return;

  csrfFetchPromise = (async () => {
    try {
      // OPTIONS request to trigger Django CSRF cookie generation
      await fetch(`${API_BASE_URL}/api/auth/register/`, {
        method: 'OPTIONS',
        credentials: 'include',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
    } catch (err) {
      console.debug('CSRF token fetch attempted');
    }
  })();
  return csrfFetchPromise;
};
```

**Updated Endpoints**:
```typescript
export const registerUser = async (userData: any) => {
  await ensureCsrfToken();  // <-- ADDED
  // ... rest of function
}

export const loginUser = async (credentials: any) => {
  await ensureCsrfToken();  // <-- ADDED
  // ... rest of function
}
```

**Impact**: Frontend explicitly fetches CSRF token before POST requests

---

## Verification & Testing

### Test Results ✅
```
✅ Registration endpoint - Works without CSRF errors
✅ Login endpoint - Accessible and functional
✅ HTTP/1.1 protocol - Confirmed in all requests
✅ Backend logs - Zero CSRF-related errors
✅ CORS headers - Properly configured
```

### What Was Tested
1. User registration flow - creates session with TOTP setup
2. Login endpoint accessibility - returns proper authentication responses
3. HTTP protocol version - confirmed HTTP/1.1 in all requests
4. Backend error logs - no 403 CSRF errors present
5. CORS header configuration - properly handled by Django

## Files Modified

| File | Changes | Purpose |
|------|---------|---------|
| `/nginx/nginx.conf` | Added `proxy_http_version 1.1;` to all proxy blocks | Fix HTTP protocol version |
| `/backend/core/settings.py` | Made CSRF/Session security DEBUG-aware | Allow HTTP cookies in dev |
| `/frontend/src/services/api.ts` | Added `ensureCsrfToken()` function | Pre-fetch CSRF token |

## How to Verify the Fix Works

### For Users
1. Navigate to `/register` or `/login`
2. Attempt to register or login
3. Should complete without CSRF errors
4. Check browser console - no 403 errors

### For Developers
```bash
# Test registration
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"Test@1234","phone_number":"1234567890"}'

# Test login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'

# Check backend logs for CSRF errors
docker-compose logs backend | grep -i csrf
```

## Prevention for Future Issues

1. **Always specify `proxy_http_version 1.1;`** in nginx proxy configurations
2. **Make security settings environment-aware** (use DEBUG flag)
3. **Pre-fetch CSRF tokens** before auth POST requests in frontend
4. **Test auth flows** with fresh Docker containers to catch proxy issues
5. **Monitor backend logs** during development for CSRF-related errors

## Deployment Notes

### For Production
- Ensure `DEBUG = False` in production settings
- CSRF and Session cookies will automatically use HTTPS-only mode
- Set `CSRF_COOKIE_DOMAIN` and `SESSION_COOKIE_DOMAIN` environment variables appropriately
- Frontend CSRF token pre-fetch works with both HTTP and HTTPS

### For Development
- `DEBUG = True` allows HTTP cookies
- No special configuration needed
- CSRF token is automatically pre-fetched by frontend

---

## Summary

The CSRF token issue has been **completely resolved** by:
1. ✅ Fixing the nginx HTTP/1.0 protocol issue
2. ✅ Making Django security settings environment-aware
3. ✅ Implementing frontend CSRF token pre-fetch

**Result**: Registration and login now work smoothly without CSRF errors! 🎉
