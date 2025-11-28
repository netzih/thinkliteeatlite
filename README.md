# Think Lite Eat Lite - Course Platform

> Break Free from YoYo Dieting Forever

A custom-built online course platform built with Next.js, TypeScript, PostgreSQL, and Prisma.

## 🚀 Current Progress

### ✅ Phase 1 - Core Signup System (COMPLETE!)

**Completed:**
- [x] Project structure setup
- [x] Next.js 14 with TypeScript configuration
- [x] Tailwind CSS with brand colors
- [x] Brand styling implementation
  - Colors: Sage, Forest Green, Teal, Charcoal, Lime
  - Fonts: Crimson Text (headings), Inter (body)
- [x] Database schema design (Prisma)
- [x] Landing page UI
- [x] Reusable UI components (Button, Input)
- [x] **Functional signup form** ✨
- [x] **Email integration (Resend)** ✨
- [x] **Welcome email with personalized links** ✨
- [x] **Protected video page with token authentication** ✨

**Phase 2 - Coming Next:**
- [ ] Admin dashboard
- [ ] Email composer & analytics
- [ ] User management interface

---

## 🎨 Brand Colors

```css
Sage Green:    #9BCBBB  (Light, calming - backgrounds)
Forest Green:  #2D5D4F  (Primary brand color - CTAs, headers)
Teal Green:    #5A8A7A  (Medium accent)
Charcoal:      #2C2D2C  (Dark text)
Lime Yellow:   #D4DD3C  (Vibrant accent - CTAs, highlights)
```

---

## 🛠 Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Components:** Shadcn/ui + Radix UI
- **Icons:** Lucide React

### Backend
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Email:** Resend API
- **Email Templates:** React Email

### Deployment
- **Platform:** Plesk (Ubuntu server)
- **Runtime:** Node.js 18+

---

## 📁 Project Structure

```
thinkliteeatlite/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Root layout with fonts
│   ├── globals.css        # Global styles & brand colors
│   ├── api/               # API routes (to be built)
│   ├── admin/             # Admin dashboard (to be built)
│   └── watch/             # Protected video page (to be built)
├── components/
│   └── ui/                # Reusable UI components
│       ├── button.tsx
│       └── input.tsx
├── lib/                   # Utility functions
│   ├── db.ts             # Database connection
│   └── utils.ts          # Helper functions
├── prisma/
│   └── schema.prisma     # Database schema
├── public/               # Static assets
│   └── Think Lite Eat Lite.png  # Brand board
└── PHASE_1_PLAN.md      # Implementation roadmap
```

---

## 🗄 Database Schema

**Models:**
- `User` - Signed up users with access tokens
- `Group` - Email groups (e.g., "All Users", "New Signups")
- `UserGroup` - Many-to-many relationship
- `EmailCampaign` - Sent email campaigns
- `EmailRecipient` - Individual email tracking (opens, clicks)
- `EmailClick` - Track clicks on links within emails
- `Admin` - Admin users for dashboard access

---

## 🏁 Getting Started

**👉 See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for complete setup instructions!**

### Quick Start

#### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your database credentials
# Then run migrations
npx prisma generate
npx prisma db push
```

### 3. Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000 to see the landing page!

---

## 📋 What's Working Now

✅ **Complete Signup Flow:**
1. User visits landing page
2. Fills out signup form
3. System creates user in database
4. Generates unique access token
5. Sends beautiful welcome email
6. User clicks link to access free 8-minute video
7. Video page validates token and shows personalized content

**Phase 2 - Coming Next:**
1. **Admin dashboard** - View all signups in nice table
2. **Email composer** - Send campaigns to groups
3. **Analytics** - Track email opens, clicks, conversions
4. **User management** - Edit users, manage groups

---

## 📚 Documentation

- **[Setup Guide](./SETUP_GUIDE.md)** - Start here! Complete setup instructions
- [Phase 1 Implementation Plan](./PHASE_1_PLAN.md)
- [Platform Evaluation](./PLATFORM_EVALUATION.md)
- [Approach Comparison](./APPROACH_COMPARISON.md)
- [Plesk Deployment Guide](./PLESK_DEPLOYMENT.md)

---

## 💡 Learning as We Build

This project is built using Option B: "We build together"
- Each component is explained
- You understand how it all works
- You can maintain it yourself

---

## 🎯 Features

**✅ Phase 1 - Complete:**
- ✅ Beautiful landing page with brand styling
- ✅ Email signup with instant access link
- ✅ Protected video page (token-based)
- ✅ Welcome email with personalized video link
- ✅ User database with automatic grouping
- ✅ Form validation and error handling
- ✅ Success/loading states

**🚧 Phase 2 - Coming Soon:**
- 🚧 Admin dashboard
- 🚧 User management interface
- 🚧 Email composer with group selection
- 🚧 Email analytics (opens, clicks, links)

---

## 🔐 Environment Variables

See `.env.example` for required environment variables:
- Database connection
- Email service (Resend)
- Admin credentials
- App URL & secrets

---

## 🚀 Deployment

This app is designed to run on **Plesk** hosting.
See [PLESK_DEPLOYMENT.md](./PLESK_DEPLOYMENT.md) for detailed deployment instructions.

---

## 📝 License

Private project - All rights reserved.

---

**Built with ❤️ for sustainable wellness and breaking free from yo-yo dieting**
