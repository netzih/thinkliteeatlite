# Plesk Deployment - Quick Start Guide

This guide walks you through deploying Think Lite Eat Lite on your Plesk server.

---

## Prerequisites

- Plesk with Node.js support enabled
- PostgreSQL available
- Test domain configured in Plesk
- SSH access (optional but helpful)

---

## Step 1: Prepare Your Domain in Plesk

1. **Log into Plesk**
2. **Go to Websites & Domains**
3. **Add Domain** or use existing test domain (e.g., `test.yourdomain.com`)
4. Make sure SSL is enabled (Let's Encrypt is free)

Note the document root path, usually:
```
/var/www/vhosts/yourdomain.com/test.yourdomain.com
```

---

## Step 2: Create PostgreSQL Database

1. In Plesk, go to **Databases**
2. Click **Add Database**
3. Fill in:
   - Database name: `thinkliteeatlite` (or `yourname_thinklite`)
   - Related site: Select your domain
4. Click **OK**

5. **Create Database User:**
   - Click **Add Database User**
   - Username: `thinklite_user` (or similar)
   - Password: Generate strong password (save this!)
   - Database: Select the database you created
   - Click **OK**

6. **Note the connection details:**
   ```
   Host: localhost
   Port: 5432
   Database: thinkliteeatlite (or whatever you named it)
   Username: thinklite_user
   Password: [the password you set]
   ```

You'll need this for the connection string:
```
postgresql://thinklite_user:password@localhost:5432/thinkliteeatlite
```

---

## Step 3: Upload Code to Server

### Option A: Using Git (Recommended)

1. In Plesk, go to **Git** (under your domain)
2. Click **Add Repository**
3. Enter your repository URL:
   ```
   https://github.com/netzih/thinkliteeatlite
   ```
4. Deployment path: `/httpdocs` (or custom path)
5. Branch: `claude/course-platform-evaluation-01NdSi7g38F7t8kgjKybpXop`
6. Click **OK**
7. Click **Pull Updates** to download code

### Option B: File Manager / FTP

1. Download the repository as ZIP from GitHub
2. In Plesk, go to **Files** → **File Manager**
3. Navigate to `/httpdocs`
4. Upload and extract all files
5. Make sure all files are in the root, not in a subfolder

After upload, your structure should look like:
```
/httpdocs/
  ├── app/
  ├── components/
  ├── lib/
  ├── prisma/
  ├── package.json
  ├── next.config.js
  └── ... (all other files)
```

---

## Step 4: Set Up Node.js in Plesk

1. Go to **Node.js** in Plesk (under your domain)
2. **Enable Node.js**
3. Configure:
   - **Node.js version**: 18.x or higher
   - **Application mode**: Production
   - **Application root**: `/httpdocs`
   - **Application startup file**: `server.js` (we'll create this)
   - **Package Manager**: npm

**Don't start it yet!** We need to set up environment variables first.

---

## Step 5: Configure Environment Variables

In Plesk **Node.js** section, scroll to **Environment Variables**.

Add these variables (one by one, click **+** for each):

```bash
# Database
DATABASE_URL=postgresql://thinklite_user:YOUR_PASSWORD@localhost:5432/thinkliteeatlite

# App URL (use your actual domain)
NEXT_PUBLIC_APP_URL=https://test.yourdomain.com

# NextAuth
NEXTAUTH_URL=https://test.yourdomain.com
NEXTAUTH_SECRET=CHANGE_THIS_TO_RANDOM_STRING_32_CHARS_MIN

# Resend (leave blank for now, we'll add later)
RESEND_API_KEY=
FROM_EMAIL=onboarding@resend.dev
```

**Important:**
- Replace `YOUR_PASSWORD` with actual database password
- Replace `test.yourdomain.com` with your actual test domain
- Generate random string for NEXTAUTH_SECRET (you can use: `openssl rand -base64 32`)

---

## Step 6: Create Server File for Plesk

Plesk needs a `server.js` file to start the app. Create this via SSH or File Manager.

**Using SSH:**
```bash
cd /var/www/vhosts/yourdomain.com/test.yourdomain.com/httpdocs
nano server.js
```

**Paste this content:**
```javascript
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('Internal server error')
    }
  })
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})
```

Save the file.

---

## Step 7: Install Dependencies

In Plesk **Node.js** section:

1. Click **NPM Install** button
2. Wait for installation (may take 2-5 minutes)
3. Check logs to ensure no errors

**Or via SSH:**
```bash
cd /var/www/vhosts/yourdomain.com/test.yourdomain.com/httpdocs
npm install
```

---

## Step 8: Set Up Database Schema

**Via SSH:**
```bash
cd /var/www/vhosts/yourdomain.com/test.yourdomain.com/httpdocs

# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma db push
```

You should see:
```
✔ Generated Prisma Client
✔ Database synchronized with Prisma schema
```

**Can't use SSH?** Contact your hosting provider to run these commands, or use Plesk's **Scheduled Tasks** to run them once.

---

## Step 9: Build the Application

**Via Plesk Node.js:**
1. In **Node.js** section, find **Run Script**
2. Enter: `npm run build`
3. Click **Run**
4. Wait for build (may take 3-5 minutes)

**Or via SSH:**
```bash
cd /var/www/vhosts/yourdomain.com/test.yourdomain.com/httpdocs
npm run build
```

---

## Step 10: Start the Application

1. In Plesk **Node.js** section:
2. Make sure these are set:
   - Application startup file: `server.js`
   - Application mode: Production
3. Click **Enable Node.js** (or **Restart App** if already enabled)

Wait 30 seconds, then visit:
```
https://test.yourdomain.com
```

You should see your landing page! 🎉

---

## Step 11: Set Up Resend Email

1. Go to [resend.com](https://resend.com) and sign up
2. Create API key
3. In Plesk **Node.js** → **Environment Variables**:
   - Edit `RESEND_API_KEY` and add your key
4. **Restart App** in Node.js section

**Test signup:**
- Fill out the form on your site
- Use your real email
- Check inbox for welcome email!

---

## Troubleshooting

### "Application not starting"

**Check logs:**
- Plesk → Node.js → **Show Logs**

Common issues:
- Missing `server.js` file
- Wrong application root path
- Environment variables not set

### "Database connection failed"

Check:
- Is DATABASE_URL correct in environment variables?
- Is PostgreSQL running?
- Database user has correct permissions?

Test connection via SSH:
```bash
psql postgresql://thinklite_user:password@localhost:5432/thinkliteeatlite
```

### "502 Bad Gateway"

- App crashed. Check Node.js logs
- Make sure `npm run build` completed successfully
- Restart the app in Plesk

### "Email not sending"

- Check RESEND_API_KEY is set
- Check Resend dashboard for errors
- Try test email first with your own address

### "Application Error" on page

- Check browser console (F12) for errors
- Check Plesk logs
- Make sure all environment variables are set
- Rebuild: `npm run build` and restart

---

## File Permissions

If you get permission errors:

**Via SSH:**
```bash
cd /var/www/vhosts/yourdomain.com/test.yourdomain.com
chown -R username:psacln httpdocs/
chmod -R 755 httpdocs/
```

Replace `username` with your system user (check with `whoami`).

---

## Testing Checklist

After deployment:

- [ ] Homepage loads at https://test.yourdomain.com
- [ ] SSL certificate is valid (green lock)
- [ ] Signup form is visible
- [ ] Can submit form with test data
- [ ] See success message
- [ ] Receive welcome email
- [ ] Email link works and shows video page
- [ ] Check database has user record: `npx prisma studio`

---

## Monitoring

**View Application Logs:**
```bash
tail -f /var/www/vhosts/yourdomain.com/logs/node_log
```

**View Error Logs:**
```bash
tail -f /var/www/vhosts/yourdomain.com/logs/error_log
```

---

## Updating Code

**If using Git in Plesk:**
1. Push changes to repository
2. In Plesk Git section, click **Pull Updates**
3. Run `npm install` (if package.json changed)
4. Run `npm run build`
5. Restart app

**If using manual upload:**
1. Upload changed files via FTP/File Manager
2. Rebuild if needed
3. Restart app

---

## Need Help?

If you get stuck:
1. Check the logs first
2. Verify all environment variables are correct
3. Make sure database is accessible
4. Try rebuilding and restarting

Let me know where you get stuck and I'll help debug!
