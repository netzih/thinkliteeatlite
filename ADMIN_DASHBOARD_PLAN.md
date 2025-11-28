# Phase 2: Admin Dashboard - Implementation Plan

## 🎯 What We're Building

A complete admin dashboard where you can:
- Log in securely
- View all signups in a searchable table
- Compose and send emails with Jodit WYSIWYG editor
- Track email campaigns

---

## 📋 Features Breakdown

### 1. Authentication System
**Pages:**
- `/admin/login` - Login page
- Middleware to protect all `/admin/*` routes

**Features:**
- Secure password hashing (bcrypt)
- Session management (NextAuth)
- Auto-logout after inactivity
- "Remember me" option

---

### 2. Dashboard Home (`/admin`)
**Stats Cards:**
- Total signups
- New signups (last 7 days)
- New signups (last 30 days)
- Video access rate

**Recent Activity:**
- Latest 10 signups
- Quick actions (view all users, compose email)

---

### 3. Users Management (`/admin/users`)
**Table Features:**
- Columns: Name, Email, Signup Date, Groups, Video Accessed
- Search by name or email
- Filter by group
- Sort by any column
- Pagination (20 per page)
- Export to CSV

**User Actions:**
- View user details
- Add/remove from groups
- Resend welcome email
- Delete user (with confirmation)

---

### 4. Groups Management (`/admin/groups`)
**Features:**
- Create new groups
- Edit group names/descriptions
- View member count
- Delete groups (can't delete "All Users")

---

### 5. Email Composer (`/admin/emails/compose`)
**Features:**
- **Jodit WYSIWYG Editor** - Full HTML email editing
- Subject line input
- Select recipient groups (checkboxes)
- Preview pane (shows how email will look)
- Send test email to yourself
- Save draft (optional)
- Send immediately

**Workflow:**
1. Write subject
2. Compose email in Jodit editor
3. Select which groups to send to
4. Preview email
5. Send test to your email
6. Review and send to all recipients

---

### 6. Email History (`/admin/emails`)
**List View:**
- All sent campaigns
- Columns: Subject, Sent Date, Recipients, Delivered, Opened, Clicked
- Click to view details

**Detail View:**
- Full email content
- Recipient list with status
- Who opened (with timestamp)
- Who clicked (with links clicked)

---

## 🔧 Tech Stack

**Authentication:** NextAuth.js + bcrypt
**Editor:** Jodit React (WYSIWYG)
**Tables:** React + Tailwind (custom components)
**Forms:** React Hook Form + Zod
**API:** Next.js API routes

---

## 📅 Build Order (What I'll Build Now)

### Session 1: Authentication (Now)
- [ ] NextAuth configuration
- [ ] Admin login page
- [ ] Protected route middleware
- [ ] Create initial admin user script

### Session 2: Dashboard Layout
- [ ] Admin layout component (sidebar, nav)
- [ ] Dashboard home with stats
- [ ] Navigation structure

### Session 3: Users Management
- [ ] Users list page with table
- [ ] Search and filter
- [ ] User details
- [ ] CSV export

### Session 4: Email Composer
- [ ] Jodit editor integration
- [ ] Email composition form
- [ ] Group selection
- [ ] Preview functionality
- [ ] Send email API

### Session 5: Email History (Later)
- [ ] Campaign list
- [ ] Campaign details
- [ ] Analytics tracking

---

## 🚀 Let's Start!

I'm going to build Sessions 1-4 now. This will give you a fully functional admin dashboard where you can:
✅ Log in securely
✅ View all signups
✅ Compose emails with Jodit
✅ Send emails to groups

Session 5 (analytics) we can add later once you start sending campaigns.

Ready to proceed?
