# Deploying to Plesk on Ubuntu

## Prerequisites

Your Plesk server needs:
- Node.js 18.x or higher (install via Plesk Node.js Selector)
- PostgreSQL database
- Domain with SSL certificate

---

## Step 1: Database Setup in Plesk

1. **Create PostgreSQL Database:**
   - Log into Plesk
   - Go to **Databases** → **Add Database**
   - Database name: `thinkliteeatlite`
   - Create a database user with full privileges
   - Note the connection details

2. **Get Connection String:**
   ```
   postgresql://username:password@localhost:5432/thinkliteeatlite
   ```

---

## Step 2: Upload Application

### Option A: Via Git (Recommended)
1. In Plesk, go to **Git** under your domain
2. Add this repository
3. Set deployment path to your domain's root (e.g., `/httpdocs`)
4. Enable automatic deployment

### Option B: Manual Upload
1. Upload all files via FTP/File Manager to `/httpdocs`
2. Make sure all files are in place

---

## Step 3: Configure Node.js in Plesk

1. Go to **Node.js** in Plesk
2. **Enable Node.js** for your domain
3. Settings:
   - **Node.js version**: 18.x or higher
   - **Application mode**: Production
   - **Application root**: `/httpdocs`
   - **Application startup file**: `server.js` (we'll create this)
   - **Custom environment variables**:
     - Add all variables from `.env.example`

---

## Step 4: Install Dependencies

In Plesk **Node.js** section:
1. Click **NPM Install** button
   - This runs `npm install` automatically
2. Wait for dependencies to install

OR via SSH:
```bash
cd /var/www/vhosts/yourdomain.com/httpdocs
npm install
```

---

## Step 5: Database Migration

Via SSH:
```bash
cd /var/www/vhosts/yourdomain.com/httpdocs
npx prisma generate
npx prisma db push
```

This creates all the database tables.

---

## Step 6: Build Application

In Plesk Node.js section, run custom script:
```bash
npm run build
```

OR via SSH:
```bash
cd /var/www/vhosts/yourdomain.com/httpdocs
npm run build
```

---

## Step 7: Create Server File for Plesk

Plesk needs a `server.js` file (we'll create this when we get to deployment).

---

## Step 8: Start Application

1. In Plesk **Node.js** section:
   - Click **Enable Node.js**
   - Click **Restart App**

2. Your app should now be running!

---

## Step 9: Configure Nginx (Automatic in Plesk)

Plesk automatically configures Nginx as a reverse proxy for Node.js apps.

Default configuration:
- Nginx listens on port 80/443
- Forwards to Node.js app on port 3000
- SSL handled by Plesk

---

## Troubleshooting

### Check Logs:
- Plesk → Node.js → **Show Logs**
- OR SSH: `tail -f /var/www/vhosts/yourdomain.com/logs/node_log`

### Common Issues:

**"Cannot find module":**
- Run `npm install` again in Node.js section

**Database connection failed:**
- Check DATABASE_URL in environment variables
- Verify PostgreSQL is running
- Check database user permissions

**Port already in use:**
- Plesk manages ports automatically
- Check if multiple Node.js apps are running

**Permissions error:**
- Ensure correct file ownership:
  ```bash
  chown -R username:psacln /var/www/vhosts/yourdomain.com/httpdocs
  ```

---

## Environment Variables in Plesk

Set these in **Node.js → Environment Variables**:

```
DATABASE_URL=postgresql://user:pass@localhost:5432/thinkliteeatlite
RESEND_API_KEY=re_your_key
FROM_EMAIL=noreply@yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=https://yourdomain.com
```

---

## Updates & Redeployment

### Via Git (if using Git integration):
1. Push changes to repository
2. Plesk automatically pulls and redeploys

### Manual:
1. Upload changed files
2. Run `npm install` (if dependencies changed)
3. Run `npm run build`
4. Restart app in Plesk Node.js section

---

## Performance Tips for Plesk

1. **Enable caching** in Nginx (Plesk → Apache & Nginx Settings)
2. **Use PM2** for process management (optional, instead of Plesk's built-in manager)
3. **Set up monitoring** via Plesk monitoring tools
4. **Regular backups** via Plesk Backup Manager

---

We'll create the specific configuration files needed for Plesk deployment when we get to that stage. For now, we're focusing on building the application itself.
