# SecureJobs Platform: Security Defenses

This document outlines the specific security protections implemented across the frontend and backend of the platform.

## 1. Cross-Site Request Forgery (CSRF) Protection
**Threat:** An attacker tricks a victim's browser into executing unwanted actions on the platform (e.g., changing their password or deleting their account) while they are logged in.

**Defense Implementations:**
- **Django Middleware:** `django.middleware.csrf.CsrfViewMiddleware` is enabled globally.
- **Strict SameSite Policy:** Authentication tokens (`access_token` and `refresh_token`) are set with `samesite='Lax'` to prevent them from being sent during cross-origin POST requests.
- **Secure Transport:** All cookies are marked as `secure=True`, guaranteeing they are only transmitted over HTTPS and avoiding interception via downgrade attacks.

## 2. Cross-Site Scripting (XSS) Protection
**Threat:** An attacker injects malicious JavaScript into public inputs (like profile bios or posts) that executes in the browser of anyone who views it, stealing session data or triggering actions.

**Defense Implementations:**
- **React Escaping:** The frontend is built using React (`.tsx`), which automatically escapes data bindings (`{profile.bio}`) before rendering them to the DOM, rendering injected `<script>` tags totally inert.
- **Django Security Middleware:** The backend enforces additional XSS headers via `SecurityMiddleware`.
- **HttpOnly Cookies:** Crucially, the JWT session tokens are stored in `httponly=True` cookies. Even if an attacker somehow executed Javascript via XSS, `document.cookie` cannot read the authentication tokens.

## 3. SQL Injection Protection
**Threat:** An attacker inputs raw SQL commands into login or search fields to manipulate backend database queries.

**Defense Implementations:**
- All query building is handled dynamically via Django's Object-Relational Mapper (ORM), e.g., `User.objects.filter(...)` or `get_object_or_404()`. The ORM automatically sanitizes parameters utilizing prepared statements, meaning malicious quotes and control characters are safely escaped at the database driver level.

## 4. Session Protection & Hijacking Defenses
**Threat:** An attacker steals an active session token over insecure Wi-Fi or uses a stale token indefinitely.

**Defense Implementations:**
- **No LocalStorage Auth:** Tokens are stored as HttpOnly cookies, not in `localStorage`, protecting them from local script extraction.
- **Short-Lived Access Tokens:** Access tokens live for just 30 minutes (`ACCESS_TOKEN_LIFETIME = timedelta(minutes=30)`).
- **Auto-Refresh Interceptor:** The frontend dynamically provisions short-lived session access by catching `401 Unauthorized` responses and rotating the session using the longer-living, secure refresh token dynamically. 

## 5. Tamper-Evident Audit Log (Blockchain properties)
**Threat:** A rogue admin or attacker attempts to cover their tracks by editing or deleting rows representing high-risk operations (e.g., role changes, account deletions).

**Defense Implementations:**
- **Cryptographic Chaining:** Each log entry stores the `SHA-256` hash of the *previous* log entry in addition to its own data. This forces the log sequence to be entirely rigid. 
- **Verifiable Integrity:** If any row in the PostgreSQL database is manually modified, deleted, or inserted out of sequence, the `current_hash` and `prev_hash` pointers for all subsequent blocks will mismatch, immediately breaking the chain and alerting superadmins to the tamper event via the Admin Dashboard's validation protocol.
