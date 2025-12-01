# Setup Guide - Getting Your App Running

This guide will walk you through setting up and testing your Think Lite Eat Lite platform.

---

## 🎯 What We Built

You now have a complete signup system with:
- ✅ Beautiful landing page with your brand colors
- ✅ Functional signup form
- ✅ Database integration (PostgreSQL + Prisma)
- ✅ Email system (Resend)
- ✅ Protected video page with token access
- ✅ Welcome email with personalized links

---

## 📋 Prerequisites

Before you start, you need:

1. **Node.js 18+** installed
2. **PostgreSQL database** (can create in Plesk)
3. **Resend account** (free tier - 100 emails/day)
4. **Domain** (for production deployment)

---

## 🚀 Step 1: Install Dependencies

```bash
cd /path/to/thinkliteeatlite
npm install
```

This installs all required packages (Next.js, Prisma, Resend, etc.)

---

## 🗄 Step 2: Set Up Database

### Option A: Using Plesk

1. Log into Plesk
2. Go to **Databases** → **Add Database**
3. Create a PostgreSQL database:
   - Database name: `thinkliteeatlite`
   - Username: (create new user)
   - Password: (strong password)
4. Note the connection details

### Option B: Local PostgreSQL

```bash
# Install PostgreSQL (if not installed)
sudo apt install postgresql

# Create database
sudo -u postgres createdb thinkliteeatlite
```

### Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit .env file
nano .env
```

Update these values in `.env`:

```bash
# Database - Update with your actual credentials
DATABASE_URL="postgresql://username:password@localhost:5432/thinkliteeatlite"

# Resend Email (get from resend.com)
RESEND_API_KEY="re_your_actual_api_key_here"
FROM_EMAIL="noreply@yourdomain.com"  # Or use resend test email

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"  # For local dev
# NEXT_PUBLIC_APP_URL="https://yourdomain.com"  # For production

# NextAuth (generate random string)
NEXTAUTH_SECRET="your_random_secret_here_use_openssl_rand_base64_32"
NEXTAUTH_URL="http://localhost:3000"  # Same as APP_URL
```

### Generate Database Schema

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (creates all tables)
npx prisma db push
```

You should see output like:
```
✔ Generated Prisma Client
✔ Database synchronized with Prisma schema
```

---

## 📧 Step 3: Set Up Resend

1. Go to [resend.com](https://resend.com)
2. Sign up for free account
3. Go to **API Keys** → **Create API Key**
4. Copy the key (starts with `re_`)
5. Add to `.env` file as `RESEND_API_KEY`

### Verify Domain (Optional but Recommended)

For production, verify your domain:
1. In Resend dashboard, go to **Domains**
2. Add your domain (e.g., `yourdomain.com`)
3. Add DNS records (Resend provides them)
4. Wait for verification (usually < 1 hour)
5. Update `FROM_EMAIL` in `.env` to use your domain

### For Testing (No Domain Needed)

You can use Resend's test email:
```bash
FROM_EMAIL="onboarding@resend.dev"
```

This works but emails may go to spam.

---

## 🎬 Step 4: Add Your Video

### Option A: YouTube (Easiest)

1. Upload your 8-minute video to YouTube
2. Set visibility to **Unlisted**
3. Copy the video ID from URL: `https://youtube.com/watch?v=VIDEO_ID_HERE`
4. Edit `app/watch/page.tsx` around line 105
5. Replace the placeholder with:

```tsx
<iframe
  src="https://www.youtube.com/embed/VIDEO_ID_HERE"
  className="absolute inset-0 w-full h-full"
  frameBorder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
  title="Think Lite Eat Lite Free Course"
/>
```

### Option B: Vimeo

1. Upload to Vimeo
2. Go to video settings → Privacy → **Hide from Vimeo.com**
3. Copy video ID
4. Replace placeholder with:

```tsx
<iframe
  src="https://player.vimeo.com/video/VIDEO_ID_HERE"
  className="absolute inset-0 w-full h-full"
  frameBorder="0"
  allow="autoplay; fullscreen; picture-in-picture"
  allowFullScreen
  title="Think Lite Eat Lite Free Course"
/>
```

---

## 🏃 Step 5: Run Development Server

```bash
npm run dev
```

You should see:
```
▲ Next.js 14.2.0
- Local:        http://localhost:3000
- Ready in 2.3s
```

Visit: **http://localhost:3000**

---

## ✅ Step 6: Test the Complete Flow

### Test Signup

1. Open http://localhost:3000
2. Fill out the signup form:
   - First Name: Test
   - Last Name: User
   - Email: your_real_email@example.com (use real email!)
3. Click "Get My Free Course"
4. You should see "Check Your Email!"

### Check Email

1. Check your inbox
2. You should receive "Welcome to Think Lite Eat Lite!"
3. Email should have:
   - Your name in greeting
   - Branded styling (green colors)
   - "Watch Your Free Course Now" button

### Test Video Access

1. Click the button in email (or copy the link)
2. Should go to `/watch?token=...`
3. Should see:
   - Welcome message with your name
   - Video player (or placeholder)
   - Course description

### Test Database

```bash
# Open Prisma Studio to view database
npx prisma studio
```

Visit http://localhost:5555

You should see:
- Your user in `User` table
- "All Users" group in `Group` table
- User connected to group in `UserGroup` table

---

## 🐛 Troubleshooting

### "Database connection failed"

Check:
- Is PostgreSQL running? `sudo systemctl status postgresql`
- Is `DATABASE_URL` correct in `.env`?
- Can you connect manually? `psql postgresql://username:password@localhost:5432/thinkliteeatlite`

### "Email not sending"

Check:
- Is `RESEND_API_KEY` correct in `.env`?
- Check Resend dashboard for errors
- Check spam folder
- Try with `onboarding@resend.dev` as FROM_EMAIL

### "Form submits but no success message"

Check browser console (F12) for errors:
- Network tab: Is `/api/signup` returning 200?
- Console tab: Any JavaScript errors?

### "Token invalid" when accessing video

Check:
- Is the full URL copied from email?
- Is `token` parameter in URL?
- Check database: Does user have `accessToken`?

---

## 📊 Viewing Signups

Right now, you can view signups in Prisma Studio:

```bash
npx prisma studio
```

**Next phase**: We'll build an admin dashboard with a nice UI!

---

## 🚀 Next Steps

You've completed Phase 1! 🎉

**What works:**
- Landing page with signup
- Email sending with personalized links
- Protected video page
- Database storing users

**What's coming in Phase 2:**
- Admin dashboard (`/admin`)
- View all signups in nice table
- Manage email groups
- Email composer
- Email analytics (opens, clicks)

---

## 📝 Testing Checklist

Before going live, test:

- [ ] Signup with valid email → Success message
- [ ] Signup with invalid email → Error message
- [ ] Signup with same email twice → Friendly message
- [ ] Receive welcome email within 1 minute
- [ ] Email has correct FROM name and email
- [ ] Email has working video link
- [ ] Video page loads with personalized greeting
- [ ] Video page shows invalid token error if bad URL
- [ ] Database records user correctly
- [ ] User added to "All Users" group

---

## 🎨 Customization

### Change Colors

Edit `tailwind.config.ts`:
```typescript
brand: {
  sage: "#9BCBBB",    // Your color here
  forest: "#2D5D4F",  // Your color here
  // etc.
}
```

### Change Email Content

Edit `lib/email.ts`:
- Update email HTML
- Change subject line
- Modify messaging

### Change Landing Page Text

Edit `app/page.tsx`:
- Update headlines
- Change benefit descriptions
- Modify CTA text

---

## 🆘 Need Help?

If you run into issues:
1. Check the error message carefully
2. Search the error in the project files
3. Check Prisma/Next.js docs
4. Ask me! I'm here to help you learn.

---

Ready to test? Run `npm install` and `npm run dev` to get started!
