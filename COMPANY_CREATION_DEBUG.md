# Company Creation Debug Guide

## Error Symptom
When creating a company, getting: "Unexpected token '<', "<html> <h"..." is not valid JSON

**This means the backend is returning an HTML error page instead of JSON.**

## Step 1: Check Backend Logs

On your production VM, run:

```bash
cd FCS_Project
docker-compose logs backend --tail=200
```

Look for Python exceptions or error messages. Take a screenshot or copy the output.

## Step 2: Verify Migrations Are Applied

The backend might not have the latest database schema.

```bash
cd FCS_Project
docker-compose exec backend python manage.py migrate --dry-run
docker-compose exec backend python manage.py migrate
```

If migrations fail, they might be corrupted or have conflicts.

## Step 3: Check If create_audit_log Is Working

The error might be in the audit logging. Try a direct test:

```bash
docker-compose exec backend python manage.py shell
>>> from accounts.audit import create_audit_log
>>> from accounts.models import CustomUser
>>> user = CustomUser.objects.first()
>>> create_audit_log('TEST', user, {'test': 'data'})
>>> from accounts.models import AuditLog
>>> AuditLog.objects.last().action
```

If this fails, there's an issue with audit logging.

## Step 4: Test Company Creation Directly

In Django shell:

```bash
docker-compose exec backend python manage.py shell
>>> from jobs.models import Company
>>> from accounts.models import CustomUser
>>> user = CustomUser.objects.filter(role='RECRUITER').first()
>>> if user:
...     c = Company.objects.create(owner=user, name="Test Company")
...     print(f"Created: {c.id}, {c.name}")
... else:
...     print("No recruiter found")
```

If this works, the model is fine. The issue is in the view logic.

## Step 5: Check Django Settings

Verify Django is configured to return JSON errors:

```bash
docker-compose exec backend python manage.py shell
>>> from django.conf import settings
>>> settings.REST_FRAMEWORK
>>> settings.DEBUG
```

If `DEBUG = True`, Django returns HTML error pages (expected in development).
If `DEBUG = False`, should return JSON errors, but might be misconfigured.

## Step 6: Verify Transaction Import

```bash
docker-compose exec backend python manage.py shell
>>> from django.db import transaction
>>> print(transaction)
```

If this fails, there's a Django installation issue.

## Step 7: Test the Endpoint Directly

Try with curl to see the exact error:

```bash
# Get CSRF token first
curl -i http://localhost:8000/api/auth/login/ 2>&1 | grep -i csrf

# Try creating company (will fail but shows error):
curl -X POST http://localhost:8000/api/companies/ \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","description":"Test"}' \
  2>&1 | head -50
```

## Most Likely Causes (In Order)

1. **Migrations not applied** - CompanyAccess, CompanySave, Company model changes not in DB
   - Fix: `docker-compose exec backend python manage.py migrate`

2. **Audit log table doesn't exist** - AuditLog model was added but migration not applied
   - Fix: `docker-compose exec backend python manage.py migrate accounts`

3. **Django version incompatibility** - Cache settings issue
   - Check Docker image Python/Django version

4. **Missing environment variables** - Settings not loaded correctly
   - Check docker-compose.yml for environment variables

5. **Import error** - create_audit_log not found or broken
   - Check backend/accounts/audit.py syntax

## If All Else Fails

Temporarily comment out the audit log to isolate the issue:

Edit backend/jobs/views.py, line 731-734:

```python
company = serializer.save(owner=self.request.user)
# TEMPORARILY DISABLED FOR DEBUG
# create_audit_log('COMPANY_CREATED', self.request.user, {
#     'company_id': company.id,
#     'company_name': company.name
# })
```

Restart backend and try again:

```bash
docker-compose restart backend
```

If it works now, the issue is in create_audit_log function. If it still fails, the issue is in serializer.save() or the Company model.

## Report Back With

1. Output of `docker-compose logs backend --tail=200`
2. Whether migrations pass
3. Whether direct Company.objects.create() works
4. Whether curl test shows the exact error message
