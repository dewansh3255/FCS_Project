# FCS Project — Secure Job Search & Professional Networking Platform

> Foundations of Computer Security Course Project
> IIIT Delhi | 2026

A full-stack, security-first professional networking and job search platform implementing end-to-end encryption, PKI-backed trust, tamper-evident audit logging, TOTP-based 2FA, and JWT-based authentication — built with Django REST Framework, React/TypeScript, PostgreSQL, Redis, and Nginx with Docker containerization.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Security Architecture](#security-architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [API Overview](#api-overview)
- [Recent Fixes](#recent-fixes)

---

## Overview

FCS Project is a modern, security-focused platform for job searching and professional networking. The platform implements industry-standard security practices including:

- **2FA via TOTP** — All users must verify with authenticator apps
- **JWT Authentication** — Stateless token-based auth in HttpOnly, Secure cookies
- **End-to-End Encryption** — Messages encrypted client-side with RSA-AES hybrid encryption
- **Resume Encryption** — All resumes encrypted at rest with per-file keys
- **Audit Logging** — Hash-chained tamper-evident logs for compliance
- **Role-Based Access** — Candidates, Recruiters, and Admins with granular permissions

### User Roles

| Role | Capabilities |
|------|-------------|
| **Candidate** | Register, upload resumes, search jobs, apply, track applications, send encrypted messages |
| **Recruiter** | Create company pages, post jobs, view applicants, update statuses, message candidates |
| **Admin** | Manage users, verify audit log integrity, system monitoring |

---

## Security Architecture

### Authentication & Session Management
- **TOTP 2FA** — Every user must verify a 6-digit OTP on registration and login via authenticator apps
- **JWT in HttpOnly Cookies** — Access/refresh tokens stored securely; never in localStorage
- **Token Expiration** — Access tokens expire in 30 minutes; refresh tokens rotate on use
- **Custom JWT Authenticator** — `CookieJWTAuthentication` extracts tokens from cookies with Authorization header fallback

### Cryptography
- **RSA-2048 Keypairs** — Generated client-side using Web Crypto API
- **Private Key Wrapping** — Encrypted with AES-GCM using password-derived key (PBKDF2, 100k iterations)
- **Message Encryption** — Hybrid encryption: AES-GCM-256 key wrapped with recipient's RSA-OAEP public key
- **Resume Encryption** — Fernet (AES-128-CBC + HMAC-SHA256) with per-file keys

### Attack Defenses
- **SQL Injection** — Django ORM parameterizes all queries
- **XSS** — React JSX auto-escapes; Django template auto-escape enabled
- **CSRF** — Middleware-based exemption for stateless JWT endpoints
- **Token Theft** — HttpOnly cookies prevent XSS-based token theft
- **Session Hijacking** — Short-lived tokens with automatic refresh rotation
- **HTTPS Enforcement** — Nginx redirects HTTP to HTTPS; TLS at reverse proxy

---

## Key Features

✅ **Completed:**
- TOTP-based 2FA with QR code enrollment
- JWT token authentication with auto-refresh
- RSA keypair generation and password-protected private key storage
- End-to-end encrypted messaging system
- Fernet-encrypted resume storage at rest
- Job posting and search with filters
- Job application workflow with status tracking
- Company management and recruiter dashboard
- Hash-chained audit logs with integrity verification
- Role-based access control (RBAC)
- Full Docker containerization

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, React Router v7 |
| **Backend** | Python 3.11, Django 4.2, Django REST Framework |
| **Database** | PostgreSQL 15 |
| **Cache** | Redis 7 |
| **Reverse Proxy** | Nginx with TLS/SSL |
| **Authentication** | djangorestframework-simplejwt, pyotp |
| **Cryptography** | Web Crypto API (client), cryptography library (server) |
| **Containerization** | Docker, Docker Compose |

---

## Project Structure

```
FCS_Project/
├── backend/
│   ├── accounts/              # Auth, profiles, messaging, audit logs
│   │   ├── models.py          # User, UserKeys, Profile, Message, AuditLog
│   │   ├── views.py           # Registration, login, TOTP, messaging
│   │   ├── authentication.py  # JWT cookie authenticator
│   │   ├── audit.py           # Hash-chain audit logging
│   │   └── urls.py
│   ├── jobs/                  # Resume, company, job, application management
│   │   ├── models.py          # Resume, Company, Job, Application
│   │   ├── views.py           # Job posting, search, applications
│   │   └── urls.py
│   ├── core/                  # Settings and URL routing
│   │   ├── settings.py        # Django configuration
│   │   ├── middleware.py      # CSRF exemption middleware
│   │   └── urls.py
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── pages/             # Page components
│       ├── components/        # Reusable UI components
│       ├── services/          # API client
│       └── utils/             # Crypto utilities
├── nginx/                     # Reverse proxy configuration
├── docker-compose.yml         # Container orchestration
└── run_migrations.sh          # Database setup script
```

---

## Getting Started

### Quick Start with Docker

```bash
# Clone repository
git clone https://github.com/dewansh3255/FCS_Project.git
cd FCS_Project

# Start all services
docker-compose up --build

# Run migrations
docker-compose exec backend python manage.py migrate

# Create admin user (optional)
docker-compose exec backend python manage.py createsuperuser
```

### Access Points

| Service | URL |
|---------|-----|
| **Frontend** | https://localhost |
| **Django Admin** | https://localhost/admin |
| **API** | https://localhost/api |

> Note: Browser may show SSL certificate warning (self-signed). This is normal for development. Click "Accept" to proceed.

### First Time Setup

1. Visit https://localhost and register a new account
2. Scan the QR code with Microsoft Authenticator or Google Authenticator
3. Enter the 6-digit OTP to complete 2FA setup
4. You'll be redirected to the dashboard
5. Complete your profile and upload resume
6. Start searching jobs or post as recruiter

## Deployment

### Production Checklist

```bash
# 1. SSH to production server
ssh user@your-server

# 2. Clone/pull latest code
git clone https://github.com/dewansh3255/FCS_Project.git
cd FCS_Project
# or: git pull origin main

# 3. Start services
docker-compose down
docker-compose build --no-cache
docker-compose up -d
sleep 20

# 4. Verify services
docker-compose ps
docker-compose logs backend | tail -30

# 5. Check no errors
docker-compose logs backend | grep -i error
docker-compose logs backend | grep -i csrf
```

### Environment Variables

For production, update these in `docker-compose.yml` or use a `.env` file:

```env
DEBUG=False
SECRET_KEY=your-production-secret-key-here
ALLOWED_HOSTS=your-domain.com
CSRF_TRUSTED_ORIGINS=https://your-domain.com
DB_HOST=db
DB_NAME=fcs_project
DB_USER=fcs_user
DB_PASS=change-this-password
REDIS_HOST=redis
```

## API Overview

### Authentication
- `POST /api/auth/register/` — Register new user
- `POST /api/auth/login/` — Step 1: Password verification
- `POST /api/auth/totp/verify/` — Step 2: OTP verification
- `GET /api/auth/auth-check/` — Check if authenticated

### Profile & Keys
- `GET/PATCH /api/auth/profile/me/` — Get/update profile
- `POST /api/auth/keys/upload/` — Upload RSA keypair
- `GET /api/auth/keys/<username>/` — Get public key

### Messaging
- `GET/POST /api/auth/messages/` — Send/receive encrypted messages
- `GET /api/auth/users/` — List users for messaging

### Jobs
- `GET/POST /api/jobs/jobs/` — List/create job postings
- `GET/PATCH /api/jobs/jobs/<id>/` — Get/update job

### Applications
- `GET/POST /api/jobs/applications/` — List/submit applications
- `PATCH /api/jobs/applications/<id>/` — Update application status

### Resumes
- `POST /api/jobs/resume/upload/` — Upload and encrypt resume
- `GET /api/jobs/resume/<id>/download/` — Decrypt and download resume
- `DELETE /api/jobs/resume/<id>/` — Delete resume

### Admin
- `GET /api/auth/audit-logs/` — View hash-chained audit logs (Admin only)

## Recent Fixes

### CSRF Token Issues (April 2026)
- **Problem**: POST/PATCH endpoints returning 403 "CSRF token missing or invalid"
- **Root Cause**: Contradictory CSRF validation — middleware exempted JWT endpoints but authentication layer was re-validating
- **Solution**: Removed duplicate CSRF enforcement; JWT auth doesn't need CSRF (stateless, not cookie-based)
- **Commits**: 731e3f1, 9a198bf, 2a297be
- **Status**: ✅ Fixed — All endpoints working without CSRF errors

### Key Improvements
- Clean, production-ready codebase
- Middleware-based CSRF exemption for API endpoints
- Simplified authentication flow
- Better error handling in JWT validation

---

## Troubleshooting

### Containers won't start
```bash
docker-compose logs backend  # Check backend logs
docker-compose logs db       # Check database logs
docker-compose ps            # Check service status
```

### Registration fails
- Ensure phone number is unique
- Check that TOTP app can scan QR code
- Verify OTP code is correct (6 digits)

### Can't access frontend
- Verify https://localhost is accessible
- Accept SSL certificate warning
- Check nginx logs: `docker-compose logs nginx`

---

## License

Academic project developed for Foundations of Computer Security course at IIIT Delhi.