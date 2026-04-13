#!/usr/bin/env python
"""
Test company creation endpoint to debug JSON error
Run this from the VM backend container
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.insert(0, '/app')

django.setup()

from accounts.models import CustomUser
from jobs.models import Company
from rest_framework.test import APIClient
from django.test import TestCase
import json

print("=" * 80)
print("COMPANY CREATION TEST")
print("=" * 80)

# Create test user
try:
    user = CustomUser.objects.create_user(
        username='test_recruiter',
        email='recruiter@test.com',
        password='testpass123',
        role='RECRUITER'
    )
    print(f"✅ Created test user: {user.username} (role={user.role})")
except Exception as e:
    user = CustomUser.objects.get(username='test_recruiter')
    print(f"✅ Using existing user: {user.username} (role={user.role})")

# Test API directly
client = APIClient()
client.force_authenticate(user=user)

print("\n" + "=" * 80)
print("TEST 1: Create Company via API")
print("=" * 80)

data = {
    'name': 'Test Company',
    'description': 'This is a test company',
    'location': 'Test Location',
    'website': 'https://test.com',
    'industry': 'Technology',
}

print(f"POST /api/jobs/companies/")
print(f"Data: {json.dumps(data, indent=2)}")

try:
    response = client.post('/api/jobs/companies/', data, format='json')
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response: {json.dumps(response.data, indent=2)}")
    
    if response.status_code == 201:
        print("✅ Company created successfully!")
        company = Company.objects.get(name='Test Company')
        print(f"   Company ID: {company.id}")
        print(f"   Owner: {company.owner.username}")
    else:
        print(f"❌ Failed to create company")
        
except Exception as e:
    print(f"❌ Exception: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 80)
print("TEST 2: Check Company Model")
print("=" * 80)

try:
    company = Company.objects.create(
        name='Direct Test Company',
        owner=user
    )
    print(f"✅ Company created via ORM")
    print(f"   ID: {company.id}")
    print(f"   Name: {company.name}")
    print(f"   Owner: {company.owner.username}")
    company.delete()
    print(f"✅ Cleaned up")
except Exception as e:
    print(f"❌ Exception: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 80)
print("TEST 3: Check Serializer")
print("=" * 80)

from jobs.serializers import CompanySerializer

company = Company.objects.filter(owner=user).first()
if company:
    try:
        serializer = CompanySerializer(company, context={'request': None})
        print(f"✅ Serializer works")
        print(f"   Data: {json.dumps(serializer.data, indent=2, default=str)}")
    except Exception as e:
        print(f"❌ Exception: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
else:
    print("⚠️  No companies found for this user")

print("\n" + "=" * 80)
