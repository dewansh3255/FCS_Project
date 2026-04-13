# FCS Project — User Guide

> Complete guide to using the FCS Platform for job search, professional networking, and secure communication.

---

## 🚀 LIVE PLATFORM

**👉 Access the live platform here: https://192.168.2.239/**

Try all features in real-time. No installation required!

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Registration & 2FA Setup](#registration--2fa-setup)
3. [Login](#login)
4. [Dashboard Overview](#dashboard-overview)
5. [Profile Management](#profile-management)
6. [Resume Management](#resume-management)
7. [Job Search & Application](#job-search--application)
8. [Messaging](#messaging)
9. [For Recruiters](#for-recruiters)
10. [Admin Features](#admin-features)
11. [Security & Privacy](#security--privacy)
12. [FAQ & Troubleshooting](#faq--troubleshooting)

---

## Getting Started

### System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- Authenticator app (Google Authenticator, Microsoft Authenticator, or Authy)

### Access the Platform

**🚀 Live Platform:**
👉 **https://192.168.2.239/**

Or for local development:
- **https://localhost** (development/local machine)

Once you navigate to the link, you should see the FCS login page.

> **Note**: You may see a security warning about SSL certificate. This is normal for self-signed certificates. Click "Advanced" or "Proceed Anyway" to continue. The connection is still encrypted with TLS.

---

## Registration & 2FA Setup

### Step 1: Register Account

1. Click **"Sign Up"** button on the login page
2. Fill in the registration form:
   - **Username**: Choose a unique username (alphanumeric, no spaces)
   - **Email**: Enter your valid email address
   - **Password**: Create a strong password (min 8 characters, uppercase, lowercase, number, special char)
   - **Phone Number**: Enter your phone number (used for 2FA backup)
   - **Role**: Select your role:
     - **Candidate** — Looking for jobs
     - **Recruiter** — Hiring candidates
3. Click **"Register"**

### Step 2: Two-Factor Authentication (2FA) Setup

1. After registration, you'll see a **QR Code** displayed on screen
2. Open your authenticator app:
   - **Google Authenticator** (iOS/Android)
   - **Microsoft Authenticator** (iOS/Android)
   - **Authy** (iOS/Android/Desktop)
3. Select "Add Account" or "+" in the app
4. Choose "Scan QR Code"
5. Scan the QR code shown on screen
6. Your authenticator app will generate a 6-digit code
7. Copy the code and paste it in the **"OTP Code"** field
8. Click **"Verify"**

✅ **Registration complete!** Your account is now secure.

> **Important**: Save your recovery codes in a safe place. You'll need them if you lose access to your authenticator app.

---

## Login

### Two-Step Login Process

#### Step 1: Password Verification
1. Go to **https://localhost** (or your domain)
2. Enter your **Username** and **Password**
3. Click **"Login"**
4. If correct, proceed to Step 2

#### Step 2: OTP Verification
1. Open your authenticator app
2. Find the code for **"FCS Platform"** (usually 6 digits, refreshes every 30 seconds)
3. Copy the 6-digit code
4. Enter it in the **"Enter OTP"** field
5. Click **"Verify"**

✅ **Logged in!** You'll be redirected to your dashboard.

### Remember Me (Optional)
- Check "**Remember this device for 7 days**" to skip 2FA on this device
- Use only on trusted devices

---

## Dashboard Overview

### Main Dashboard Screen

After login, you'll see your personalized dashboard with:

#### Left Sidebar Navigation
- 🏠 **Dashboard** — Home page with overview
- 👤 **Profile** — Your profile and settings
- 📄 **Resumes** — Upload and manage resumes
- 🔍 **Search Jobs** — Find and apply for jobs (Candidates)
- 📋 **My Applications** — Track application status (Candidates)
- 🏢 **Companies** — Manage company pages (Recruiters)
- 👥 **Applicants** — View job applicants (Recruiters)
- 💬 **Messages** — Encrypted inbox
- 🔐 **Admin Panel** — System management (Admins only)
- ⚙️ **Settings** — Account settings and security

#### Main Content Area
- Welcome message with your name and role
- Quick stats (jobs applied, messages, etc.)
- Recent activity or recommended jobs

---

## Profile Management

### Edit Your Profile

1. Click **"Profile"** in the sidebar
2. Update your information:
   - **First Name & Last Name**
   - **Bio** — Write about yourself (headline, experience summary)
   - **Location** — City and country
   - **Skills** — Add relevant skills (e.g., Python, Project Management, etc.)
   - **Experience** — Years of professional experience
   - **Education** — Degree and institution

3. **Privacy Settings** (for each field):
   - 🌍 **Public** — Visible to everyone
   - 👥 **Connections Only** — Visible to people you've connected with
   - 🔒 **Private** — Only visible to you

4. Click **"Save Profile"**

### Privacy & Data Protection

- Your encrypted private key is stored on your device
- Your profile is encrypted on the server
- Messages are end-to-end encrypted (even admins can't read them)
- You can make fields public or private per your preference

### Account Security

Click **⚙️ Settings** to:
- **Change Password** — Update your account password
- **View Active Sessions** — See where you're logged in
- **Download Data** — Get a copy of your data
- **Delete Account** — Permanently delete your account and all data

---

## Resume Management

### Upload a Resume

1. Click **"Resumes"** in the sidebar
2. Click **"Upload New Resume"**
3. Select a PDF file from your computer
4. Add a title (e.g., "Software Engineer Resume - 2026")
5. Choose which jobs this resume is for (optional)
6. Click **"Upload"**

✅ **Your resume is encrypted and secure!**

### Resume Security
- ✅ Files are encrypted before storage
- ✅ Only you can download your own resume
- ✅ Recruiters need your permission to view
- ✅ Each resume has a unique encryption key

### Manage Resumes

1. Click **"Resumes"** in the sidebar
2. You'll see all your uploaded resumes
3. For each resume, you can:
   - 👁️ **View** — See details and download
   - 📋 **Use for Applications** — Set as default for job applications
   - 🗑️ **Delete** — Remove permanently
   - 🔗 **Share Link** — Generate a link to share with recruiters

### Download Resume

1. Click **"Resumes"**
2. Find the resume you want
3. Click **"Download"**
4. Enter your password (for security verification)
5. Resume will download as encrypted file
6. It's automatically decrypted on your device

---

## Job Search & Application

### Search for Jobs

1. Click **"Search Jobs"** in the sidebar
2. You'll see a list of available job postings

#### Filter Jobs

Use the search and filter options:
- 🔍 **Keyword Search** — Search by title, company, skills
- 📍 **Location** — Filter by city or country
- 💼 **Job Type** — Full-time, Part-time, Contract, Freelance
- 💰 **Salary Range** — Minimum and maximum salary
- 📅 **Posted Date** — Last 7 days, 30 days, etc.

### View Job Details

1. Click on any job listing
2. You'll see:
   - Job title and company
   - Description and responsibilities
   - Required and preferred skills
   - Location and job type
   - Salary range
   - Application deadline
   - Company contact information

### Apply for a Job

1. Click **"Apply Now"** button on job listing
2. Select a resume to attach (if you have multiple)
3. Add a cover letter (optional, but recommended):
   - Explain why you're interested in the role
   - Highlight relevant experience
   - Keep it concise (2-3 paragraphs)
4. Add optional notes or links:
   - Portfolio link
   - GitHub profile
   - LinkedIn profile
5. Click **"Submit Application"**

✅ **Application submitted!** Check "My Applications" to track status.

### Track Applications

1. Click **"My Applications"** in the sidebar
2. See all your applications with status:
   - 📬 **Applied** — Just submitted
   - 👀 **Reviewed** — Recruiter has reviewed
   - 📞 **Interviewed** — Invited for interview
   - ❌ **Rejected** — Not selected
   - ✅ **Offer** — Job offer received
3. Click any application to:
   - View feedback from recruiter
   - See recruiter's notes
   - Withdraw application

---

## Messaging

### Encrypted Messaging

All messages on this platform are **end-to-end encrypted**:
- ✅ Only sender and recipient can read messages
- ✅ Server cannot decrypt or read messages
- ✅ Messages are secure even if database is compromised
- ✅ Perfect for confidential conversations

### Send a Message

1. Click **"Messages"** in the sidebar
2. Click **"New Message"** or select a conversation
3. Choose recipient:
   - Search by username or email
   - Or select from recent conversations
4. Type your message
5. Click **"Send"**

### Read Messages

1. Click **"Messages"** in the sidebar
2. Click on a conversation to open it
3. Messages are automatically decrypted when you view them
4. Your password is used to decrypt your private key (only happens on your device)

### Delete Messages

1. Open a conversation
2. Hover over a message
3. Click **"Delete"** or 🗑️ icon
4. Message is permanently deleted for you (recipient still has copy)

> **Note**: If you accidentally send a message, delete it immediately. The recipient may have already read it.

---

## For Recruiters

### Create a Company

1. Click **"Companies"** in the sidebar
2. Click **"Create New Company"**
3. Fill in company details:
   - Company name
   - Description (about the company)
   - Location (headquarters)
   - Website (optional)
   - Industry
   - Company size
4. Click **"Create"**

✅ **Company created!** You can now post jobs.

### Manage Your Company

1. Click **"Companies"** in the sidebar
2. Click on your company
3. You can:
   - Edit company information
   - Add team members (other recruiters)
   - View all posted jobs
   - See all applicants

### Post a Job

1. Click **"Companies"** → Select your company
2. Click **"Post New Job"**
3. Fill in job details:
   - **Job Title** — Position name (e.g., "Senior Python Developer")
   - **Description** — Job description, responsibilities
   - **Required Skills** — List skills candidates must have
   - **Preferred Skills** — Nice-to-have skills
   - **Location** — Where the job is based
   - **Job Type** — Full-time, Part-time, Contract, Freelance, Remote
   - **Salary** — Minimum and maximum salary
   - **Application Deadline** — When applications close
   - **Number of Openings** — How many positions available
4. Click **"Post Job"**

✅ **Job posted!** Candidates can now apply.

### Manage Applicants

1. Click **"Applicants"** in the sidebar (or "Jobs" → Job → "View Applicants")
2. You'll see all candidates who applied
3. For each applicant, you can:
   - 👁️ **View Profile** — See candidate's profile and skills
   - 📄 **Download Resume** — Get their resume (they'll see you viewed it)
   - 💬 **Message** — Send encrypted message to candidate
   - ⭐ **Rate** — Rate the candidate (1-5 stars)
   - ✏️ **Add Notes** — Internal notes about candidate
   - 📊 **Update Status** — Change application status (see below)

### Update Application Status

Progress through the hiring funnel:

1. **Applied** — Initial submission
2. **Reviewed** — You've reviewed their resume
3. **Interviewed** — Interview scheduled/completed
4. **Rejected** — Not moving forward
5. **Offer** — Making a job offer

Steps:
1. Click on applicant
2. Click **"Update Status"**
3. Select new status
4. Add optional message to candidate (they'll be notified)
5. Click **"Save"**

### Message Candidates

1. Click **"Applicants"** and find a candidate
2. Click **"Message"** button
3. Type your message
4. Click **"Send"**

Messages are encrypted — candidates can only read them if they decrypt with their private key.

---

## Admin Features

> **Note**: Only accounts with Admin role can access these features.

### Admin Dashboard

1. Click **"Admin Panel"** in the sidebar
2. See system statistics:
   - Total users, jobs, applications
   - System health and performance
   - Recent activity

### Manage Users

1. Click **"Users"** in Admin Panel
2. You can:
   - 👁️ **View** — See user profile and activity
   - 🔒 **Lock/Unlock** — Disable suspicious accounts
   - 🗑️ **Delete** — Remove user (irreversible)
   - 📧 **Message** — Send system message to user
   - 📋 **View Audit Log** — See all user actions

### Audit Logs

1. Click **"Audit Logs"** in Admin Panel
2. View all system events:
   - User registration and login
   - File uploads and downloads
   - Privilege changes
   - Security events

3. Click **"Verify Chain Integrity"** to:
   - Verify logs haven't been tampered with
   - Check hash chain validity
   - Download audit report

### System Settings

1. Click **"Settings"** in Admin Panel
2. Configure:
   - Platform name and description
   - Security policies
   - Email templates
   - API keys
   - Rate limits
   - Backup settings

### Monitor System Health

Check:
- Database status and size
- Redis cache status
- Disk usage
- Email delivery status
- Recent errors and warnings

---

## Security & Privacy

### Best Practices

#### Passwords
- ✅ Use a strong password (min 12 characters recommended)
- ✅ Include uppercase, lowercase, numbers, and special characters
- ✅ Never share your password
- ✅ Don't reuse passwords from other sites
- ✅ Change password every 90 days

#### 2FA
- ✅ Enable 2FA (mandatory on this platform)
- ✅ Save backup codes in a secure location
- ✅ Use a trusted authenticator app
- ✅ Never screenshot your recovery codes
- ✅ Consider using a password manager like 1Password or Bitwarden

#### Messages
- ✅ Verify recipient before sending sensitive information
- ✅ Don't share passwords via messages
- ✅ Delete old conversations with sensitive info
- ✅ Remember: messages are encrypted, but content is your responsibility

#### Resumes
- ✅ Remove personal ID numbers before uploading
- ✅ Use generic company names if concerned about privacy
- ✅ Review file permissions before sharing
- ✅ Keep sensitive information (SSN, etc.) out of resume

#### Profile
- ✅ Be cautious what you make public
- ✅ Use privacy settings for sensitive information
- ✅ Consider your security when accepting connections
- ✅ Report suspicious profiles to admins

### What's Encrypted

| Item | Encryption | Notes |
|------|-----------|-------|
| Password | PBKDF2+SHA256 | Hashed, never stored plaintext |
| Private Key | AES-GCM | Encrypted with password-derived key |
| Messages | AES-GCM + RSA | Hybrid end-to-end encryption |
| Resumes | Fernet (AES+HMAC) | Encrypted at rest on server |
| Connections | TLS/SSL | In transit, encrypted over HTTPS |

### Privacy Controls

Use the **Privacy Settings** on your profile:
- 🌍 **Public** — Visible to everyone
- 👥 **Connections** — Only visible to connections
- 🔒 **Private** — Only you can see

---

## FAQ & Troubleshooting

### Account & Authentication

**Q: I forgot my password. What should I do?**
A: Click "Forgot Password?" on login page. Enter your email, and we'll send a password reset link. You'll need to verify with 2FA.

**Q: I lost access to my authenticator app. How do I get back in?**
A: You have two options:
1. Use a recovery code (if you saved them during signup)
2. Contact support with proof of identity (they may need your recovery codes)

**Q: Can I use the same authenticator code twice?**
A: No, each code is unique and time-limited (30 seconds). Each login requires a fresh code.

**Q: How do I change my role from Candidate to Recruiter?**
A: Click Settings → Account Settings → Change Role. You may need to verify additional information.

### Resume & Documents

**Q: What file formats are supported for resumes?**
A: PDF files only. Make sure your PDF is readable and not corrupted.

**Q: My resume file is too large. What's the limit?**
A: Maximum file size is 10 MB. Compress your PDF if needed.

**Q: Can recruiters see my resume without permission?**
A: Only if you attach it to your application. Individual recruiters cannot browse your resumes.

**Q: Can I delete a resume if I've already applied with it?**
A: Yes, but the recruiter still has a copy. Deleting only removes it from your account.

### Jobs & Applications

**Q: How long does it take to hear back about my application?**
A: Depends on the recruiter. Set expectations during interview, but typically 2-7 days.

**Q: Can I apply for the same job twice?**
A: No, each application is unique. You can only apply once per job posting.

**Q: Can I withdraw my application?**
A: Yes, click on the application and select "Withdraw". The recruiter will be notified.

**Q: Why can't I see all jobs?**
A: Jobs may have expired (deadline passed). Try clearing filters or searching.

### Messaging

**Q: Are all messages encrypted?**
A: Yes, all messages use end-to-end encryption. Even server admins cannot read them.

**Q: Can I unsend a message?**
A: You can delete it on your end, but the recipient may have already seen it.

**Q: Who can message me?**
A: Any authenticated user on the platform can message you. Block features coming soon.

**Q: What happens if the recipient deletes their account?**
A: Messages are deleted for them but remain on your account.

### For Recruiters

**Q: How many jobs can I post?**
A: Unlimited. No job posting limit per company.

**Q: Can I edit a job after posting?**
A: Yes, you can edit until the deadline. Changes apply to future applicants.

**Q: Do I see candidates who start but don't submit applications?**
A: No, only submitted applications appear in your applicants list.

**Q: Can I message candidates who didn't apply?**
A: Not directly through the platform. Use their provided contact info if available.

### Technical Issues

**Q: I'm getting a "SSL certificate" warning. Is it safe?**
A: Yes, this is normal for development. Click "Proceed Anyway" or "Advanced" to continue.

**Q: The site is loading slowly. What can I do?**
A: Try:
1. Clear browser cache (Ctrl+Shift+Del)
2. Close other tabs/programs
3. Try a different browser
4. Wait a few minutes and try again

**Q: I see a 403 "Permission Denied" error. What does it mean?**
A: Your account doesn't have permission for that action. You may need:
- To be logged in
- To be the correct role (e.g., Recruiter to post jobs)
- To contact an admin

**Q: My messages aren't sending. What should I do?**
A: Check:
1. Are you connected to the internet?
2. Is the recipient's account still active?
3. Refresh the page and try again
4. Contact support if error persists

---

## Support & Help

### Contact Support

If you encounter issues not covered in this guide:

1. **In-app Support** — Click "Help" or "?" icon for live chat
2. **Email** — support@fcsproject.local
3. **Documentation** — Check README.md in project repository

### Report Security Issues

If you discover a security vulnerability:

1. **Do NOT** post it publicly
2. **Email** security@fcsproject.local with details
3. Include steps to reproduce (if possible)
4. We'll investigate and credit you in fixes

### Provide Feedback

We'd love to hear your feedback!

- Click "Feedback" in the app
- Tell us what you like
- Suggest improvements
- Report bugs

---

## Glossary

- **2FA** — Two-Factor Authentication (password + OTP)
- **OTP** — One-Time Password (6-digit code from authenticator)
- **Recruiter** — Person hiring candidates
- **Candidate** — Person applying for jobs
- **End-to-End Encryption** — Messages encrypted so only sender and receiver can read
- **Hash Chain** — Tamper-proof audit log (like blockchain)
- **TOTP** — Time-based One-Time Password (standard 2FA method)
- **JWT** — JSON Web Token (authentication token)
- **Private Key** — Secret key for decryption (keep safe!)
- **Public Key** — Key for encryption (safe to share)

---

## Version Information

- **Document Version**: 1.0
- **Last Updated**: April 2026
- **Platform Version**: 1.0
- **Compatible Browsers**: Chrome, Firefox, Safari, Edge (latest versions)

---

**Happy job hunting! 🚀**

For more information, visit the README.md or contact support.
