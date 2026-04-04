# Phase 3: March Milestone - Job Board & Application Workflow Implementation

**Member C: The Data Guardian**
**Implementation Date:** March 2026

## Overview

This document outlines the complete implementation of Phase 3, focusing on building the core functional engine of the platform: the Job Board and Application Workflow.

---

## 1. Models Implementation ✅

### 1.1 Company Model
**Location:** [`backend/jobs/models.py`](backend/jobs/models.py)

```python
class Company(models.Model):
    owner = ForeignKey(User, related_name='companies')
    name = CharField(max_length=200)
    description = TextField(blank=True)
    location = CharField(max_length=200, blank=True)
    website = URLField(blank=True)
    created_at = DateTimeField(auto_now_add=True)
```

**Features:**
- Owner is linked to a RECRUITER user (enforced via permissions)
- Stores company metadata: name, description, location, website
- Tracks creation timestamp for audit purposes

### 1.2 Job Model (JobPosting)
**Location:** [`backend/jobs/models.py`](backend/jobs/models.py)

```python
class Job(models.Model):
    class JobType(TextChoices):
        FULL_TIME = 'FULL_TIME'
        INTERNSHIP = 'INTERNSHIP'
        REMOTE = 'REMOTE'
    
    company = ForeignKey(Company, related_name='jobs')
    title = CharField(max_length=200)
    description = TextField()
    required_skills = TextField(blank=True)  # JSON-compatible comma-separated storage
    location = CharField(max_length=200, blank=True)
    job_type = CharField(choices=JobType.choices)
    salary_min = IntegerField(null=True, blank=True)
    salary_max = IntegerField(null=True, blank=True)
    deadline = DateField(null=True, blank=True)
    created_at = DateTimeField(auto_now_add=True)
    is_active = BooleanField(default=True)  # For soft-delete functionality
```

**Features:**
- Skills stored as comma-separated text (filterable via query)
- Salary range support (min, max)
- Application deadline tracking
- Job status management (active/inactive)
- Foreign key to Company ensures organizational integrity
- Created at timestamp for audit trails

### 1.3 Application Model
**Location:** [`backend/jobs/models.py`](backend/jobs/models.py)

```python
class Application(models.Model):
    class Status(TextChoices):
        APPLIED = 'APPLIED'
        REVIEWED = 'REVIEWED'
        INTERVIEWED = 'INTERVIEWED'
        REJECTED = 'REJECTED'
        OFFER = 'OFFER'
    
    applicant = ForeignKey(User, related_name='applications')
    job = ForeignKey(Job, related_name='applications')
    resume = ForeignKey(Resume, on_delete=SET_NULL, null=True)
    cover_note = TextField(blank=True)
    status = CharField(choices=Status.choices, default=APPLIED)
    recruiter_notes = TextField(blank=True)
    applied_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('applicant', 'job')  # Prevent duplicate applications
```

**Features:**
- Status enum tracks progression: Applied → Reviewed → Interviewed → Rejected/Offer
- Links to User (applicant), Job, and Resume for complete context
- Unique constraint prevents duplicate applications from same user to same job
- Includes recruiter notes for communication
- Tracks application and update timestamps for audit logging

---

## 2. API Endpoints Implementation ✅

### 2.1 Company Endpoints

#### Create Company
```
POST /api/jobs/companies/
```
- **Authentication:** Required (IsAuthenticated)
- **Permissions:** Any authenticated user
- **Behavior:** Creates company with logged-in user as owner
- **Audit Log:** COMPANY_CREATED event recorded

#### List Companies
```
GET /api/jobs/companies/
```
- **Authentication:** Required
- **Returns:** All companies (paginated)

#### Get Company Details
```
GET /api/jobs/companies/{id}/
```
- **Authentication:** Required
- **Permissions:** Any authenticated user can view
- **Returns:** Company details

#### Update Company
```
PUT /api/jobs/companies/{id}/
PATCH /api/jobs/companies/{id}/
```
- **Authentication:** Required
- **Permissions:** Only company owner
- **Behavior:** Updates company details
- **Audit Log:** COMPANY_UPDATE event with changes
- **Error:** PermissionDenied if not owner

#### Delete Company
```
DELETE /api/jobs/companies/{id}/
```
- **Authentication:** Required
- **Permissions:** Only company owner
- **Audit Log:** COMPANY_DELETE event with company details

### 2.2 Job Board Endpoints

#### Create Job Posting
```
POST /api/jobs/jobs/
```
- **Authentication:** Required
- **Permissions:** Any authenticated user (typically RECRUITER)
- **Required Fields:** company, title, description
- **Optional Fields:** required_skills, location, job_type, salary_min, salary_max, deadline
- **Audit Log:** JOB_POSTING_CREATED event with job_id, title, company_id
- **Response:** 201 Created with job details

#### List Job Postings
```
GET /api/jobs/jobs/
```
- **Authentication:** Required
- **Query Parameters:**
  - `q`: Search query (searches title, description, skills, company name)
  - `job_type`: Filter by job type (FULL_TIME, INTERNSHIP, REMOTE)
  - `location`: Filter by location (substring match)
- **Returns:** Active jobs filtered by query parameters
- **Example:** `/api/jobs/jobs/?q=python&job_type=REMOTE&location=New York`

#### Get Job Details
```
GET /api/jobs/jobs/{id}/
```
- **Authentication:** Required
- **Returns:** Complete job details with company info

#### Update Job Posting
```
PUT /api/jobs/jobs/{id}/
PATCH /api/jobs/jobs/{id}/
```
- **Authentication:** Required
- **Permissions:** Only company owner
- **Audit Log:** JOB_POSTING_UPDATED with is_active_changed flag
- **Error:** PermissionDenied if not company owner
- **Use Case:** Update job details, deactivate job, extend deadline

#### Delete Job Posting
```
DELETE /api/jobs/jobs/{id}/
```
- **Authentication:** Required
- **Permissions:** Only company owner
- **Audit Log:** JOB_POSTING_DELETED with job details
- **Error:** PermissionDenied if not company owner


### 2.3 Application Workflow Endpoints

#### Apply for Job (Create Application)
```
POST /api/jobs/applications/
```
- **Authentication:** Required
- **Permissions:** Only CANDIDATE users
- **Required Fields:** job, resume (optional)
- **Optional Fields:** cover_note
- **Business Logic:**
  - Applicant automatically set from authenticated user
  - Candidate selects existing resume or applies without resume
  - unique_together constraint prevents duplicate applications
- **Audit Log:** APPLICATION_SUBMITTED event with:
  - application_id
  - job_id
  - job_title
  - resume_id (if provided)
- **Response:** 201 Created with application details
- **Error Scenarios:**
  - 400 Bad Request: Missing required fields
  - 409 Conflict: Duplicate application (same candidate to same job)

#### List Applications (User-Specific)
```
GET /api/jobs/applications/
```
- **Authentication:** Required
- **Permissions:** Different views based on user role:
  - **CANDIDATE:** Sees only their own applications
  - **RECRUITER:** Sees all applications to their company's jobs
  - **ADMIN:** Sees all applications (if enhanced with admin permissions)
- **Returns:** Filtered application list ordered by creation date
- **Use Case:** 
  - Candidates track their job applications
  - Recruiters manage incoming applications

#### Get Application Details
```
GET /api/jobs/applications/{id}/
```
- **Authentication:** Required
- **Permissions:** 
  - Applicant can view their own applications
  - Recruiter can view applications for their jobs
- **Returns:** Complete application details
- **Fields:** id, applicant, job, resume, cover_note, status, recruiter_notes, applied_at, updated_at

#### Update Application Status
```
PUT /api/jobs/applications/{id}/
PATCH /api/jobs/applications/{id}/
```
- **Authentication:** Required
- **Permissions:** Only recruiter (company owner) can update
- **Updatable Fields:** status, recruiter_notes
- **Audit Log:** APPLICATION_STATUS_CHANGED event with:
  - application_id
  - job_id
  - applicant_id
  - old_status
  - new_status
- **Error:** PermissionDenied if not company owner
- **Use Case:** Recruiter progresses application through workflow

#### Get All Applications for a Job (NEW)
```
GET /api/jobs/jobs/{job_id}/applications/
```
- **Authentication:** Required
- **Permissions:** Only company owner can access
- **Returns:** All applications for the specified job, ordered by applied_at
- **Use Case:** Recruiter views all applicants for a specific job posting
- **Error:** PermissionDenied if not company owner
- **Error:** 404 if job doesn't exist
- **Response Example:**
  ```json
  [
    {
      "id": 1,
      "applicant": 5,
      "applicant_username": "john_doe",
      "job": 12,
      "job_title": "Senior Backend Engineer",
      "resume": 3,
      "cover_note": "I'm very interested in this role...",
      "status": "INTERVIEWED",
      "recruiter_notes": "Strong technical skills, follow up tomorrow",
      "applied_at": "2026-03-15T10:30:00Z",
      "updated_at": "2026-03-20T14:15:00Z"
    }
  ]
  ```

---

## 3. Permission & Access Control ✅

### 3.1 Company Management Permissions

| Operation | ADMIN | RECRUITER (Owner) | RECRUITER (Other) | CANDIDATE |
|-----------|-------|-------------------|-------------------|-----------|
| View all  | ✅    | ✅                | ✅                | ✅        |
| Create    | ✅    | ✅                | ✅                | ❌        |
| Edit own  | ✅    | ✅                | ❌                | ❌        |
| Delete    | ✅    | ✅                | ❌                | ❌        |

### 3.2 Job Posting Permissions

| Operation | ADMIN | RECRUITER (Owner) | RECRUITER (Other) | CANDIDATE |
|-----------|-------|-------------------|-------------------|-----------|
| View all  | ✅    | ✅                | ✅                | ✅        |
| Create    | ✅    | ✅                | ❌                | ❌        |
| Edit own  | ✅    | ✅                | ❌                | ❌        |
| Delete    | ✅    | ✅                | ❌                | ❌        |

### 3.3 Application Permissions

| Operation | ADMIN | RECRUITER | CANDIDATE (Applicant) | CANDIDATE (Other) |
|-----------|-------|-----------|----------------------|-------------------|
| View own company apps | ✅ | ✅ | ❌ | ❌ |
| View own app | ✅ | ❌ | ✅ | ❌ |
| Apply | ❌ | ❌ | ✅ | ✅ |
| Update status | ✅ | ✅* | ❌ | ❌ |
| View all job apps | ✅ | ✅* | ❌ | ❌ |
| Add recruiter notes | ✅ | ✅* | ❌ | ❌ |

*Only for their company's jobs

---

## 4. Audit Logging Integration ✅

All major operations trigger audit log events via `create_audit_log()` function.

### 4.1 Job Posting Events

#### JOB_POSTING_CREATED
```python
{
    "job_id": 12,
    "title": "Senior Backend Engineer",
    "company_id": 5
}
```

#### JOB_POSTING_UPDATED
```python
{
    "job_id": 12,
    "title": "Senior Backend Engineer",
    "company_id": 5,
    "is_active_changed": false
}
```

#### JOB_POSTING_DELETED
```python
{
    "job_id": 12,
    "title": "Senior Backend Engineer",
    "company_id": 5
}
```

### 4.2 Application Workflow Events

#### APPLICATION_SUBMITTED
```python
{
    "application_id": 45,
    "job_id": 12,
    "job_title": "Senior Backend Engineer",
    "resume_id": 3
}
```

#### APPLICATION_STATUS_CHANGED
```python
{
    "application_id": 45,
    "job_id": 12,
    "applicant_id": 8,
    "old_status": "APPLIED",
    "new_status": "INTERVIEWED"
}
```

### 4.3 Company Events

#### COMPANY_UPDATE
```python
{
    "company_id": 5,
    "name": "Tech Corp Inc"
}
```

#### COMPANY_DELETE
```python
{
    "company_id": 5,
    "name": "Tech Corp Inc"
}
```

---

## 5. Data Consistency & Integrity ✅

### 5.1 Unique Constraints
- **Application Model:** `(applicant, job)` - Prevents duplicate applications from same candidate to same job

### 5.2 Referential Integrity
- Company → User (Owner): CASCADE delete
- Job → Company: CASCADE delete
- Application → User (Applicant): CASCADE delete
- Application → Job: CASCADE delete
- Application → Resume: SET_NULL (allows soft-delete of resumes)

### 5.3 Soft Deletes
- Job model uses `is_active` BooleanField for soft deletes
- Listing endpoints filter by `is_active=True`
- Allows job history preservation without data loss

---

## 6. Integration with Member A (User Roles) ✅

The implementation leverages the User roles defined by Member A in Phase 2:

- **ADMIN Role:** Full access to all functionality
- **RECRUITER Role:** 
  - Can create/manage companies
  - Can post and manage jobs for their companies
  - Can view applications for their company's jobs
  - Can update application status and add recruiter notes
- **CANDIDATE Role:** 
  - Can view all job postings
  - Can apply to jobs
  - Can view their own applications
  - Can manage their resumes

---

## 7. Integration with Member D (Audit Logging) ✅

Member D is responsible for advanced audit logging functionality. Our implementation provides:

**Data prepared for audit logs:**

1. **Job Posting Changes:**
   - Created: `job_id`, `title`, `company_id`
   - Updated: `job_id`, `title`, `company_id`, `is_active_changed`
   - Deleted: `job_id`, `title`, `company_id`

2. **Application Status Updates:**
   - Status transitions captured with: `application_id`, `job_id`, `applicant_id`, `old_status`, `new_status`
   - Timestamp and user captured by `create_audit_log()`

3. **User** and **Timestamp** context:
   - All audit logs include authenticated user
   - ISO format timestamps recorded
   - SHA-256 hash chaining for immutability (via Member D's implementation)

---

## 8. Testing Guidelines

### 8.1 Setup Test User Roles
```bash
# In Django shell or migration
python manage.py shell

from accounts.models import User

# Create test recruiter
recruiter = User.objects.create_user(
    username='recruiter1', 
    email='recruiter@example.com',
    password='test123',
    role='RECRUITER'
)

# Create test candidate
candidate = User.objects.create_user(
    username='candidate1',
    email='candidate@example.com',
    password='test123',
    role='CANDIDATE'
)
```

### 8.2 Test Scenarios

#### Company Creation
```bash
POST /api/jobs/companies/
{
    "name": "Tech Corp",
    "website": "https://techcorp.com",
    "location": "San Francisco, CA"
}
```

#### Job Posting
```bash
POST /api/jobs/jobs/
{
    "company": 1,
    "title": "Senior Backend Engineer",
    "description": "Looking for experienced backend developer...",
    "required_skills": "Python,Django,PostgreSQL",
    "job_type": "FULL_TIME",
    "salary_min": 120000,
    "salary_max": 160000,
    "deadline": "2026-04-30"
}
```

#### Job Application
```bash
POST /api/jobs/applications/
{
    "job": 1,
    "resume": 3,
    "cover_note": "I'm very interested in this position..."
}
```

#### View Applications for Job
```bash
GET /api/jobs/jobs/1/applications/
# Recruiter only - must own the company
```

#### Update Application Status
```bash
PATCH /api/jobs/applications/45/
{
    "status": "INTERVIEWED",
    "recruiter_notes": "Strong candidate, follow up after team review"
}
```

---

## 9. Database Migrations ✅

Migration file: [`backend/jobs/migrations/0004_company_job_application.py`](backend/jobs/migrations/0004_company_job_application.py)

**Run migrations:**
```bash
python manage.py migrate jobs
```

**Models created:**
- `jobs.Company`
- `jobs.Job`
- `jobs.Application`

---

## 10. File Structure

```
backend/
├── jobs/
│   ├── models.py          # Company, Job, Application models
│   ├── serializers.py     # Serializers for API responses
│   ├── views.py           # All API views with permissions
│   ├── urls.py            # URL routing
│   ├── admin.py           # Django admin configuration
│   ├── migrations/
│   │   └── 0004_company_job_application.py
│   └── tests.py
├── accounts/
│   ├── models.py          # User model with roles
│   ├── audit.py           # Audit logging utilities
│   └── audit_models.py    # AuditLog model (for Member D)
└── core/
    └── settings.py        # Django settings
```

---

## 11. Next Steps for Deployment

1. **Environment Configuration:**
   - Ensure PostgreSQL database is running
   - Configure `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS` environment variables

2. **Run Migrations:**
   ```bash
   python manage.py migrate
   ```

3. **Create Superuser:**
   ```bash
   python manage.py createsuperuser
   ```

4. **Test Endpoints:**
   - Use Postman or curl to test all endpoints
   - Verify permissions are enforced correctly

5. **Frontend Integration:**
   - Update frontend to consume new API endpoints
   - Implement job board UI with search/filter
   - Implement application submission flow

---

## 12. API Response Examples

### List Jobs Response
```json
{
  "count": 25,
  "next": "/api/jobs/jobs/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "company": 1,
      "company_name": "Tech Corp",
      "title": "Senior Backend Engineer",
      "description": "Looking for experienced backend developer with 5+ years of experience...",
      "required_skills": "Python,Django,PostgreSQL,Redis",
      "location": "San Francisco, CA",
      "job_type": "FULL_TIME",
      "salary_min": 120000,
      "salary_max": 160000,
      "deadline": "2026-04-30",
      "created_at": "2026-03-15T10:30:00Z",
      "is_active": true
    }
  ]
}
```

### Application Status Response
```json
{
  "id": 45,
  "applicant": 8,
  "applicant_username": "john_doe",
  "job": 1,
  "job_title": "Senior Backend Engineer",
  "resume": 3,
  "cover_note": "I'm very interested in this role because...",
  "status": "INTERVIEWED",
  "recruiter_notes": "Strong technical skills. Follow up after team consensus.",
  "applied_at": "2026-03-15T11:00:00Z",
  "updated_at": "2026-03-20T15:30:00Z"
}
```

---

## Summary

✅ **Phase 3 Complete:**
- Company & Job Models built with relational structure
- Job Board API with full CRUD operations
- Application Workflow with candidate apply functionality
- Recruiter view for managing applications per job
- Permission-based access control
- Audit logging integration for all major operations
- Data integrity via unique constraints and referential integrity
- Ready for frontend integration and testing

**Member C responsibilities fulfilled:**
1. ✅ Establish relational structure for Company and Job models
2. ✅ Build Job Board API with access control
3. ✅ Implement Application Workflow with status tracking
4. ✅ Enable Application submission and recruiter view
5. ✅ Prepare audit log data for Member D
6. ✅ Ensure User role alignment with Member A
