# Phase 1: Landing Page + Email System + Protected Video

## What We're Building

A minimal viable product (MVP) that includes:

1. ✅ **Landing page** with email signup form
2. ✅ **Backend admin dashboard** to view all signups
3. ✅ **Email group management** system
4. ✅ **Email composer** with group selection
5. ✅ **Email analytics** (opens, clicks, deliveries)
6. ✅ **Protected video page** for 8-minute free course
7. ✅ **Personalized access links** sent on signup

---

## Recommended Tech Stack

### Frontend
- **Next.js 14** (App Router) - React framework with SSR
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Beautiful pre-built components
- **React Hook Form** - Form handling
- **Zod** - Form validation

### Backend
- **Next.js API Routes** - Backend endpoints (same codebase)
- **Prisma** - Database ORM
- **PostgreSQL** - Database (you can host on your server)
- **NextAuth.js** - Admin authentication
- **tRPC** (optional) - Type-safe API layer

### Email System
- **Resend** - Email sending API ($0 for first 3k emails/month, then $0.33/1k)
  - OR **Amazon SES** - ($0.10 per 1k emails)
  - OR **Self-hosted** using Nodemailer (more complex)
- **React Email** - Beautiful email templates in code

### Video Hosting
- **Vimeo** (private videos with domain restrictions)
  - OR **YouTube** (unlisted videos)
  - OR **Mux** (professional, usage-based pricing)

### Analytics
- **Custom** - We'll build email tracking into the system
- **Plausible** or **Google Analytics** - Page analytics

### Deployment
- **Your Server** (Docker + Docker Compose)
- OR **Vercel** for Next.js + Your server for PostgreSQL

---

## Database Schema

```prisma
// User who signed up
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  firstName     String?
  lastName      String?
  accessToken   String   @unique  // Personalized link token
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  groups        UserGroup[]
  emailStats    EmailRecipient[]
}

// Email groups (e.g., "All Users", "New Signups", "Engaged Users")
model Group {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  createdAt   DateTime @default(now())

  users       UserGroup[]
  emails      EmailCampaign[]
}

// Many-to-many relationship
model UserGroup {
  userId    String
  groupId   String
  addedAt   DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  group     Group    @relation(fields: [groupId], references: [id], onDelete: Cascade)

  @@id([userId, groupId])
}

// Email campaigns sent
model EmailCampaign {
  id          String   @id @default(cuid())
  subject     String
  htmlContent String   @db.Text
  textContent String   @db.Text
  sentAt      DateTime @default(now())
  sentBy      String   // Admin user who sent it

  groups      Group[]
  recipients  EmailRecipient[]
}

// Individual email tracking
model EmailRecipient {
  id           String   @id @default(cuid())
  userId       String
  campaignId   String
  delivered    Boolean  @default(false)
  opened       Boolean  @default(false)
  clicked      Boolean  @default(false)
  openedAt     DateTime?
  clickedAt    DateTime?
  trackingId   String   @unique  // For tracking pixel and links

  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  campaign     EmailCampaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  clicks       EmailClick[]

  @@unique([userId, campaignId])
}

// Track individual link clicks
model EmailClick {
  id           String   @id @default(cuid())
  recipientId  String
  url          String
  clickedAt    DateTime @default(now())

  recipient    EmailRecipient @relation(fields: [recipientId], references: [id], onDelete: Cascade)
}

// Admin users
model Admin {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String   // Hashed
  createdAt DateTime @default(now())
}
```

---

## Features Breakdown

### 1. Landing Page (`/`)

**Features:**
- Hero section with value proposition
- Email signup form (email, first name, last name)
- Benefits section highlighting the free 8-minute course
- Social proof (optional: testimonials, student count)
- Footer with social links

**Flow:**
1. User enters email and name
2. Form validates input
3. Submit creates user in database
4. Generates unique access token
5. Adds user to "All Users" group
6. Sends welcome email with personalized video link
7. Shows success message

**Endpoint:** `POST /api/signup`

---

### 2. Admin Dashboard (`/admin`)

**Protected Route** - Requires admin login

**Pages:**

#### 2.1 Dashboard Home (`/admin`)
- Total signups (all time)
- New signups (last 7 days, 30 days)
- Email stats (total sent, open rate, click rate)
- Recent signups table

#### 2.2 Users List (`/admin/users`)
- Searchable table of all users
- Columns: Email, Name, Signup Date, Groups, Video Accessed
- Filter by group
- Export to CSV
- Add/remove from groups (bulk actions)

#### 2.3 Groups Management (`/admin/groups`)
- Create new groups
- View groups with member counts
- Edit/delete groups
- Assign users to groups

#### 2.4 Email Composer (`/admin/emails/compose`)
- Rich text editor (TipTap or similar)
- Subject line
- Select recipient groups (checkbox list)
- Preview pane
- Send test email
- Schedule send (optional for later)
- Send immediately button

**Features:**
- Preview shows how email will look
- Automatically generates text version from HTML
- Shows recipient count before sending
- Confirms before sending

#### 2.5 Email Analytics (`/admin/emails`)
- List of all sent campaigns
- Per-campaign stats:
  - Recipients count
  - Delivered count
  - Open rate (%)
  - Click rate (%)
  - Top clicked links
- Click into campaign for detailed view:
  - List of recipients with status
  - Timeline of opens/clicks
  - Link click breakdown

---

### 3. Protected Video Page (`/watch`)

**Access:** Only via personalized link

**URL Format:** `/watch?token=abc123xyz`

**Flow:**
1. User clicks link from email
2. Token validated against database
3. If valid, show video page
4. If invalid, show error and link to signup

**Features:**
- Vimeo/YouTube embedded player
- Video title and description
- CTA button to "Get the Full Course" (for later)
- Track when user accessed video (analytics)

**Security:**
- Token is single-use OR time-limited (you decide)
- No authentication required (frictionless)
- Can't share link (optional: IP-lock the token)

---

### 4. Email Tracking System

#### Open Tracking
- Embed 1x1 transparent pixel in emails
- Pixel URL: `/api/track/open?id=trackingId`
- When loaded, marks email as opened
- Records timestamp

#### Click Tracking
- Replace all links in email with tracking URLs
- Format: `/api/track/click?id=trackingId&url=encodedUrl`
- Redirects to actual URL
- Records click timestamp and URL

#### Implementation
```typescript
// Original email link
<a href="https://example.com">Click here</a>

// Becomes
<a href="https://yoursite.com/api/track/click?id=abc123&url=https%3A%2F%2Fexample.com">Click here</a>
```

---

## Implementation Steps (Week by Week)

### Week 1: Foundation
**Days 1-2: Project Setup**
- [ ] Initialize Next.js project with TypeScript
- [ ] Set up Tailwind CSS + Shadcn/ui
- [ ] Configure PostgreSQL database
- [ ] Set up Prisma schema
- [ ] Create initial migrations
- [ ] Set up environment variables

**Days 3-5: Landing Page**
- [ ] Design landing page UI
- [ ] Create signup form component
- [ ] Build `/api/signup` endpoint
- [ ] Implement form validation
- [ ] Add success/error states
- [ ] Test signup flow

**Days 6-7: Email Integration**
- [ ] Set up Resend/SES account
- [ ] Create email templates with React Email
- [ ] Build welcome email template
- [ ] Implement email sending on signup
- [ ] Generate personalized access tokens
- [ ] Test email delivery

---

### Week 2: Admin Dashboard

**Days 1-3: Authentication & Dashboard Home**
- [ ] Set up NextAuth.js
- [ ] Create admin login page
- [ ] Build dashboard layout (sidebar, nav)
- [ ] Create dashboard home with stats
- [ ] Add recent signups widget

**Days 4-5: User Management**
- [ ] Build users list page with table
- [ ] Implement search and filters
- [ ] Add pagination
- [ ] Create CSV export functionality

**Days 6-7: Group Management**
- [ ] Create groups CRUD pages
- [ ] Build group assignment UI
- [ ] Implement bulk user actions
- [ ] Test group operations

---

### Week 3: Email System

**Days 1-3: Email Composer**
- [ ] Set up rich text editor (TipTap)
- [ ] Build compose UI
- [ ] Add group selection
- [ ] Create email preview
- [ ] Build send functionality

**Days 4-5: Email Tracking**
- [ ] Implement tracking pixel system
- [ ] Build link tracking system
- [ ] Create tracking API endpoints
- [ ] Test tracking in different email clients

**Days 6-7: Email Analytics**
- [ ] Build campaigns list page
- [ ] Create campaign detail view
- [ ] Implement stats calculations
- [ ] Add charts/graphs (optional)

---

### Week 4: Video Page & Polish

**Days 1-2: Protected Video Page**
- [ ] Create `/watch` page
- [ ] Implement token validation
- [ ] Embed video player
- [ ] Add access logging
- [ ] Test token security

**Days 3-4: Testing & Bug Fixes**
- [ ] End-to-end testing of signup flow
- [ ] Test email sending and tracking
- [ ] Cross-browser testing
- [ ] Mobile responsiveness
- [ ] Fix any bugs

**Days 5-7: Deployment & Documentation**
- [ ] Set up Docker configuration
- [ ] Deploy to your server
- [ ] Configure domain and SSL
- [ ] Write admin user guide
- [ ] Load testing
- [ ] Go live!

---

## Development Costs (If You Build Yourself)

**Your Time:**
- ~80-120 hours of development
- ~20-30 hours of testing/debugging
- ~10 hours of deployment

**Services:**
- Email sending: $0-20/month (depending on volume)
- Video hosting: $0-20/month (Vimeo basic or YouTube free)
- Domain: $12/year
- SSL: Free (Let's Encrypt)
- **Total: ~$20-40/month**

**If Hiring Developer:**
- 100-150 hours × $50-150/hour = $5,000-22,500
- But you learn and own everything

---

## Alternative: I Help You Build It

If you want, we can build this together in phases:

**Approach 1: I write it, you review**
- I create all the code
- You review and test
- We iterate based on your feedback

**Approach 2: Pair programming**
- I explain as I build
- You learn the codebase
- You can maintain it yourself

**Approach 3: I build foundation, you customize**
- I create the core system
- You handle design/styling
- You add custom features

---

## What Happens After Phase 1?

Once Phase 1 is live and working, you can add:

**Phase 2: Paid Course Platform**
- Stripe payment integration
- Course content management
- Video lessons with progress tracking
- Quiz/assessment system
- Student dashboard

**Phase 3: Community & Live Features**
- Discussion forums
- Live Q&A sessions (Zoom integration)
- Student-to-student messaging
- Course certificates

**Phase 4: Advanced Marketing**
- A/B testing for landing pages
- Advanced email sequences (drip campaigns)
- Affiliate program
- Coupon/discount system

---

## Next Steps

**If you want to proceed with Phase 1:**

1. **Confirm tech stack** - Any preferences or changes?
2. **Confirm timeline** - 4 weeks realistic? Faster/slower?
3. **Decide approach** - Build together? You build? I build?
4. **Set up accounts** - Email service, video hosting
5. **Start coding!**

I can start building this **right now** if you're ready. We'll go step by step, and you'll see it come together incrementally.

What do you think? Ready to start with Week 1?
