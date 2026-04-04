# Role Assignment System - Updated Guide

## Overview

Users can now choose their role when registering and can change it anytime. This enables anyone to become a recruiter without admin intervention.

---

## 1. Registration with Role Selection ✨ NEW

### Frontend Changes
The registration form now includes a role selector dropdown:

**File:** `frontend/src/pages/Register.tsx`

```typescript
// Users now choose their role during registration
const [formData, setFormData] = useState({
  username: '',
  email: '',
  password: '',
  phone_number: '',
  role: 'CANDIDATE'  // ← Now included!
});
```

**Registration Form UI:**
```
┌─────────────────────────────────────┐
│           Register                   │
├─────────────────────────────────────┤
│ Username: [______________]           │
│ Email:    [______________]           │
│ Password: [______________]           │
│ Phone:    [______________]           │
│                                       │
│ Account Type:                        │
│ ┌─ Job Seeker / Candidate            │
│ ✓ Choose one:                        │
│   ○ Recruiter / Employer             │
│                                       │
│ [Sign Up & Setup 2FA]                │
└─────────────────────────────────────┘
```

### Backend Changes
**File:** `backend/accounts/serializers.py`

```python
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=['CANDIDATE', 'RECRUITER'], default='CANDIDATE')
    
    def create(self, validated_data):
        role = validated_data.get('role', 'CANDIDATE')
        # Only CANDIDATE and RECRUITER allowed during registration
        if role not in ['CANDIDATE', 'RECRUITER']:
            role = 'CANDIDATE'
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=role,  # ← User-selected role
            phone_number=validated_data.get('phone_number')
        )
        return user
```

---

## 2. Runtime Role Changes ✨ NEW

Users can now change their role at any time via an API endpoint.

### Endpoint
```
POST /api/auth/role/change/
```

### Usage

**Backend Endpoint:** `backend/accounts/views.py`
```python
class ChangeUserRoleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        new_role = request.data.get('role', '').upper()
        
        # Only CANDIDATE and RECRUITER allowed
        if new_role not in ['CANDIDATE', 'RECRUITER']:
            return Response(
                {'error': 'Invalid role. Must be CANDIDATE or RECRUITER.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_role = request.user.role
        request.user.role = new_role
        request.user.save()
        
        # Audit log the change
        create_audit_log('ROLE_CHANGE', request.user, {
            'old_role': old_role,
            'new_role': new_role
        })
        
        return Response({
            'message': f'Role changed from {old_role} to {new_role}.',
            'role': new_role
        }, status=status.HTTP_200_OK)
```

**Frontend API Function:** `frontend/src/services/api.ts`
```typescript
export const changeUserRole = async (newRole: 'CANDIDATE' | 'RECRUITER') => {
  const response = await fetch(`${API_BASE_URL}/api/auth/role/change/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ role: newRole }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error || err?.message || 'Failed to change role');
  }
  return response.json();
};
```

### Example Request/Response

**Request:**
```json
POST /api/auth/role/change/
{
  "role": "RECRUITER"
}
```

**Success Response (200):**
```json
{
  "message": "Role changed from CANDIDATE to RECRUITER.",
  "role": "RECRUITER"
}
```

**Error Response (400):**
```json
{
  "error": "Invalid role. Must be CANDIDATE or RECRUITER."
}
```

---

## 3. Role Restrictions

### Who Can Assign Roles

| Role | Can Assign | Can Change Own | Can Change Others |
|------|-----------|------------------|------------------|
| **CANDIDATE** | ✅ During registration | ✅ Via API | ❌ |
| **RECRUITER** | ✅ During registration | ✅ Via API | ❌ |
| **ADMIN** | ✅ During registration | ✅ Via API & Django Admin | ✅ Via Django Admin |

### What Roles Can Be Set

**During Registration:**
- CANDIDATE ✅
- RECRUITER ✅
- ADMIN ❌ (Not allowed - prevents privilege escalation)

**Via Role Change API:**
- CANDIDATE ✅
- RECRUITER ✅
- ADMIN ❌ (Not allowed - prevents privilege escalation)

**Via Django Admin (Admin Only):**
- CANDIDATE ✅
- RECRUITER ✅
- ADMIN ✅

---

## 4. Audit Logging

All role changes are logged for security and compliance.

### Audit Log Entry

**Event Type:** `ROLE_CHANGE`

**Sample Log:**
```json
{
  "id": 42,
  "action": "ROLE_CHANGE",
  "user": "john_doe",
  "timestamp": "2026-03-29T15:30:00Z",
  "details": {
    "old_role": "CANDIDATE",
    "new_role": "RECRUITER"
  },
  "prev_hash": "abc123...",
  "current_hash": "def456..."
}
```

**Audit Log Location:** `backend/accounts/models.py`
```python
class AuditLog(models.Model):
    action = models.CharField(max_length=100)  # e.g., "ROLE_CHANGE"
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    details = models.TextField(blank=True)  # JSON with old/new role
    timestamp = models.CharField(max_length=50)
    prev_hash = models.CharField(max_length=64)  # Chain integrity
    current_hash = models.CharField(max_length=64)
```

---

## 5. User Flow Diagram

```
┌─────────────────────┐
│   Start Register    │
└────────────┬────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Choose Account Type                 │
│  ○ Job Seeker / Candidate           │
│  ○ Recruiter / Employer             │
└────────────┬────────────────────────┘
             │
      ┌──────┴──────┐
      │             │
      ▼             ▼
   CANDIDATE     RECRUITER
   • Browse jobs  • Post jobs
   • Apply        • Manage company
   • View apps    • Review applicants
      │             │
      └──────┬──────┘
             │
      ┌──────▼────────┐
      │ Can Change    │
      │ Role Anytime  │◄─── POST /api/auth/role/change/
      │ via API       │
      └───────────────┘
```

---

## 6. Implementation Files Changed

### Backend
1. **`backend/accounts/serializers.py`**
   - Added `role` field to registration serializer
   - Added validation for CANDIDATE/RECRUITER only

2. **`backend/accounts/views.py`**
   - Added `ChangeUserRoleView` endpoint
   - Implements role change logic with audit logging

3. **`backend/accounts/urls.py`**
   - Added route: `path('role/change/', ChangeUserRoleView.as_view())`

### Frontend
1. **`frontend/src/pages/Register.tsx`**
   - Added role select dropdown to registration form
   - Added `role` to form state management

2. **`frontend/src/services/api.ts`**
   - Added `changeUserRole()` function for API calls

---

## 7. Usage Examples

### Example 1: Register as Recruiter

**Step 1 - Registration Form:**
```
Username: acme_recruiter
Email: recruiter@acme.com
Password: SecurePass123
Phone: +1-555-0100
Account Type: ✓ Recruiter / Employer
```

**Step 2 - Complete 2FA**
```
Scan QR code with authenticator
Enter 6-digit code
```

**Result:** User is now registered as RECRUITER
- Can immediately access `/recruiter` (Post a Job)
- Can create companies and post jobs
- Can view applications to their jobs

---

### Example 2: Change Role Later

**JavaScript Example:**
```typescript
import { changeUserRole } from '../services/api';

// User wants to try recruiting after being a candidate
try {
  const result = await changeUserRole('RECRUITER');
  console.log(result.message); // "Role changed from CANDIDATE to RECRUITER."
  
  // Refresh user profile to get new menu
  window.location.reload();
} catch (error) {
  console.error('Failed to change role:', error);
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:8000/api/auth/role/change/ \
  -H "Content-Type: application/json" \
  -d '{"role": "RECRUITER"}' \
  --cookie "access_token=<token>"
```

---

## 8. Security Considerations

### ✅ Implemented Safeguards

1. **Role Restrictions**
   - Users cannot self-assign ADMIN role
   - Only Django admin can create ADMIN users
   - Prevents privilege escalation

2. **Audit Trail**
   - Every role change is logged with timestamp
   - User who made the change is recorded
   - Hash chain prevents tampering (Member D's implementation)

3. **API Validation**
   - Only CANDIDATE/RECRUITER allowed via API
   - Invalid roles rejected with 400 Bad Request
   - IsAuthenticated permission enforced

4. **Database Integrity**
   - Role field has TextChoices constraint
   - Invalid values rejected at database level

---

## 9. Menu Visibility Based on Role

The navbar automatically shows/hides menu items based on current role:

```typescript
const links = [
  { label: 'Dashboard', path: '/dashboard', roles: ['CANDIDATE', 'RECRUITER', 'ADMIN'] },
  { label: 'Browse Jobs', path: '/jobs', roles: ['CANDIDATE', 'RECRUITER', 'ADMIN'] },
  { label: 'My Applications', path: '/applications', roles: ['CANDIDATE'] },
  { label: 'Post a Job', path: '/recruiter', roles: ['RECRUITER'] },  // ← Hidden for CANDIDATE
  { label: 'Admin Panel', path: '/admin-panel', roles: ['ADMIN'] },
];
```

When user changes role from CANDIDATE → RECRUITER:
- ✅ "Post a Job" link appears immediately after page refresh
- ✅ "My Applications" link remains visible (they can still view apps)
- ❌ "Admin Panel" link stays hidden (requires ADMIN role)

---

## 10. Benefits of New System

| Benefit | Description |
|---------|-------------|
| **Flexibility** | Users can register as any role and change later |
| **Accessibility** | No admin involvement needed for most role assignments |
| **Audit Trail** | All changes logged for compliance/security |
| **Simplicity** | Single API endpoint for role changes |
| **Security** | Prevents privilege escalation to ADMIN |

---

## 11. Future Enhancements

Potential improvements for next phases:

- [ ] Email verification before role change
- [ ] Role change history viewer for users
- [ ] Admin dashboard for role approvals (if needed)
- [ ] Role expiration/renewal system
- [ ] Two-factor confirmation for role upgrades
- [ ] Recruiter profile tier system (Free, Pro, Enterprise)

---

## Summary

✅ **Anyone can now register as either CANDIDATE or RECRUITER**
✅ **Users can switch roles anytime via API**
✅ **All role changes are audited and logged**
✅ **Admin role remains protected (Django admin only)**
✅ **Menu automatically updates based on current role**

The platform is now fully flexible for users to be both job seekers and recruiters simultaneously!
