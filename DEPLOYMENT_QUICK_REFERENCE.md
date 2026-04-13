# Quick Deployment Reference - CSRF Fix

## ✅ Status: Code Committed & Pushed to GitHub

**Commit**: `bbe13d7` - Fix: Resolve CSRF token validation errors in auth endpoints

### What Changed:
1. ✅ `nginx/nginx.conf` - Added HTTP/1.1 protocol support
2. ✅ `backend/core/settings.py` - Environment-aware CSRF security
3. ✅ `frontend/src/services/api.ts` - CSRF token pre-fetch
4. ✅ `CSRF_TOKEN_RESOLUTION.md` - Complete documentation

---

## 🚀 Quick Deploy on Production VM

### One-Command Deploy (Copy & Paste):
```bash
cd /path/to/FCS_Project && git pull origin main && docker-compose down && docker-compose build --no-cache && docker-compose up -d && sleep 20 && docker-compose ps
```

### Step-by-Step (Safer):
```bash
# 1. Connect to VM
ssh user@your-vm-ip

# 2. Update code
cd /path/to/FCS_Project
git pull origin main

# 3. Redeploy with Docker
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 4. Wait and verify
sleep 20
docker-compose ps

# 5. View logs
docker-compose logs backend --tail=50
```

---

## ✅ Quick Test on Production

```bash
# Test Registration (replace domain)
curl -X POST https://your-domain.com/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"prodtest123","email":"prodtest@example.com","password":"Test@123","phone_number":"9876543210"}'

# Test Login
curl -X POST https://your-domain.com/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password"}'

# Should NOT see: "CSRF token missing or invalid" errors
# Should see: Normal auth responses
```

---

## 📋 Files Changed

| File | Change | Impact |
|------|--------|--------|
| `nginx/nginx.conf` | `proxy_http_version 1.1` | Fixes cookie transmission through proxy |
| `backend/core/settings.py` | DEBUG-aware CSRF settings | Works in dev (HTTP) and prod (HTTPS) |
| `frontend/src/services/api.ts` | `ensureCsrfToken()` function | Pre-fetches token before auth |

---

## 🔄 Rollback (If Needed)

```bash
cd /path/to/FCS_Project
git reset --hard HEAD~1
docker-compose down
docker-compose up -d
```

---

## 📊 What This Fixes

- ❌ "CSRF token missing or invalid" errors → ✅ Fixed
- ❌ Registration failures → ✅ Fixed
- ❌ Intermittent login failures → ✅ Fixed
- ❌ HTTP/1.0 protocol issues → ✅ Fixed to HTTP/1.1

---

## 🆘 Troubleshooting

**If services don't start:**
```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs nginx
```

**If you see CSRF errors still:**
```bash
# Verify settings
docker-compose exec backend python manage.py shell -c \
  "from django.conf import settings; print('DEBUG:', settings.DEBUG)"

# Check if DEBUG=False (production) - CSRF_COOKIE_SECURE should be True
# Check if DEBUG=True (development) - CSRF_COOKIE_SECURE should be False
```

**Complete rebuild (nuclear option):**
```bash
docker-compose down -v
docker system prune -a
docker-compose build --no-cache
docker-compose up -d
```

---

## ✨ Key Points

1. **No database migration needed** - Only config and code changes
2. **Backward compatible** - Works with existing deployed code
3. **Environment-aware** - Dev mode uses HTTP, Production uses HTTPS
4. **Zero downtime possible** - Can deploy during off-peak hours
5. **Fully tested** - All endpoints verified before production push

---

## 📞 Support

If you encounter issues:

1. Check backend logs: `docker-compose logs backend`
2. Check the CSRF_TOKEN_RESOLUTION.md for detailed explanation
3. Verify git pull succeeded: `git log -1`
4. Verify docker build: `docker-compose ps`
5. Test endpoints: Use curl commands above

---

**Ready to deploy? Run the one-command deploy above! 🚀**
