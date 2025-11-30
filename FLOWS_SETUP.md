# Email Flows Setup Guide

This guide will help you set up automated email flows for your course platform.

## Overview

Email flows are automated email sequences triggered by user actions like:
- **Signup** - Welcome sequence for new users
- **Video Watch** - Follow-up emails after watching the free video

## Database Migration

First, you need to apply the database schema changes:

```bash
# SSH into your Plesk server
cd /path/to/your/app

# Run the database migration
npx prisma db push

# Regenerate Prisma client
npx prisma generate
```

## Setting Up the Cron Job

The flows system uses a cron job to check for and send pending emails. You have two options:

### Option 1: Plesk Scheduled Tasks (Recommended)

1. Go to Plesk → Tools & Settings → Scheduled Tasks
2. Click "Add Task"
3. Configure:
   - **Command:** `curl -X POST https://llgl.shluchimtalk.com/api/cron/process-flows -H "Authorization: Bearer YOUR_SECRET_HERE"`
   - **Schedule:** Every hour (or as frequently as you want to check)
   - **Description:** Process email flows

4. Add CRON_SECRET to your environment variables:
   - Go to Plesk → Node.js for your domain
   - Add environment variable: `CRON_SECRET=your-random-secret-key`
   - Generate a secure secret: `openssl rand -base64 32`

### Option 2: External Cron Service

Use a free service like [cron-job.org](https://cron-job.org) or [EasyCron](https://www.easycron.com):

1. Create account
2. Add new cron job:
   - **URL:** `https://llgl.shluchimtalk.com/api/cron/process-flows`
   - **Method:** POST
   - **Headers:** `Authorization: Bearer YOUR_SECRET_HERE`
   - **Schedule:** Every hour
3. Add `CRON_SECRET` environment variable in Plesk

## Creating Your First Flow

### 1. Access the Admin Dashboard

Go to: `https://llgl.shluchimtalk.com/admin/flows`

### 2. Create a Welcome Flow

Click "New Flow" and configure:

**Flow Details:**
- Name: "Welcome Sequence"
- Description: "4-email nurture sequence for new signups"
- Trigger: "User Signup"
- Flow is active: ✓

**Email Steps:**

**Step 1 - Immediate Welcome**
- Send after: 0 days (immediately)
- Subject: `Welcome to Think Lite Eat Lite, {{firstName}}!`
- Content:
```html
<p>Hi {{firstName}},</p>

<p>Welcome to the Think Lite Eat Lite community! 🌱</p>

<p>Your free course is ready. Click here to watch:</p>
<p><a href="{{videoLink}}">Watch Your Free Course →</a></p>

<p>See you inside!</p>
```

**Step 2 - Day 1 Follow-up**
- Send after: 1 day
- Subject: `{{firstName}}, did you watch the video?`
- Content:
```html
<p>Hi {{firstName}},</p>

<p>Yesterday you signed up for the Think Lite Eat Lite free course.</p>

<p>Have you had a chance to watch it yet?</p>

<p><a href="{{videoLink}}">Watch Now (Only 8 Minutes) →</a></p>

<p>It's a quick watch with powerful insights you can start using today.</p>
```

**Step 3 - Day 3 Success Stories**
- Send after: 3 days
- Subject: `Here's what others are saying...`
- Content:
```html
<p>Hi {{firstName}},</p>

<p>I wanted to share what others are saying about the course:</p>

<blockquote>
"This completely changed how I think about food!" - Sarah M.
</blockquote>

<p>If you haven't watched yet, there's still time:</p>
<p><a href="{{videoLink}}">Watch Your Free Course →</a></p>
```

**Step 4 - Day 7 Final CTA**
- Send after: 7 days
- Subject: `Ready for more?`
- Content:
```html
<p>Hi {{firstName}},</p>

<p>Over the past week, you've had access to the free Think Lite Eat Lite course.</p>

<p>If you found it valuable, I have exciting news...</p>

<p>The full course is launching soon! Reply to this email if you'd like early access.</p>

<p>To your health,<br>
Think Lite Eat Lite Team</p>
```

### 3. Create a Video Engagement Flow

Click "New Flow" again:

**Flow Details:**
- Name: "Video Engagement"
- Description: "Follow-up after watching free video"
- Trigger: "Video Watched"
- Flow is active: ✓

**Email Steps:**

**Step 1 - Immediate Congrats**
- Send after: 0 days
- Subject: `Great job, {{firstName}}! 🎉`
- Content:
```html
<p>Hi {{firstName}},</p>

<p>Congratulations on watching the Think Lite Eat Lite course!</p>

<p>Here are your next steps:</p>
<ol>
  <li>Apply one strategy from the video today</li>
  <li>Watch the video again for deeper insights (bookmark it!)</li>
  <li>Share with a friend who needs to hear this</li>
</ol>

<p>I'll check in with you in a couple days!</p>
```

**Step 2 - Day 2 Check-in**
- Send after: 2 days
- Subject: `How's it going, {{firstName}}?`
- Content:
```html
<p>Hi {{firstName}},</p>

<p>It's been 2 days since you watched the course. How's it going?</p>

<p>Have you tried any of the strategies yet?</p>

<p>Reply to this email and let me know what resonated most with you.</p>
```

## Available Merge Tags

Use these variables in your email content (both subject and body):

- `{{firstName}}` - User's first name
- `{{lastName}}` - User's last name
- `{{email}}` - User's email address
- `{{fullName}}` - User's full name
- `{{videoLink}}` - Personal video access link
- `{{unsubscribeLink}}` - Unsubscribe link

## Testing Your Flows

1. **Test with a new signup:**
   - Sign up with a test email
   - Check that the flow emails are scheduled in the database
   - Wait for the cron job to run (or trigger manually)

2. **Manual trigger the cron job:**
   ```bash
   curl -X POST https://llgl.shluchimtalk.com/api/cron/process-flows \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

3. **Check the logs:**
   - SSH into your server
   - Check Node.js app logs for flow processing output

## Monitoring

### Check Scheduled Emails

You can query the database to see pending emails:

```sql
SELECT u.email, f.name, s.subject, e.scheduledFor, e.status
FROM "EmailFlowExecution" e
JOIN "User" u ON e."userId" = u.id
JOIN "EmailFlow" f ON e."flowId" = f.id
JOIN "EmailFlowStep" s ON e."stepId" = s.id
WHERE e.status = 'pending'
ORDER BY e.scheduledFor ASC;
```

### Flow Statistics

Check how many emails have been sent:

```sql
SELECT f.name, e.status, COUNT(*)
FROM "EmailFlowExecution" e
JOIN "EmailFlow" f ON e."flowId" = f.id
GROUP BY f.name, e.status
ORDER BY f.name, e.status;
```

## Troubleshooting

### Emails Not Sending

1. **Check cron job is running:**
   - Verify the scheduled task in Plesk
   - Or check external cron service logs

2. **Check for errors:**
   - Look at app logs: `pm2 logs` or Plesk logs
   - Check for "Failed to trigger flow" errors

3. **Verify flows are enabled:**
   - Go to /admin/flows
   - Make sure the flow and steps are marked as active

### Duplicate Emails

Flows are only triggered once per user per trigger. If a user signs up again, flows won't re-trigger.

To manually re-trigger for testing, update the database:

```sql
-- Delete existing executions for a test user
DELETE FROM "EmailFlowExecution"
WHERE "userId" = 'user-id-here';
```

## Best Practices

1. **Start small:** Create one flow, test it thoroughly, then add more
2. **Monitor performance:** Check open rates and adjust timing/content
3. **Personalize:** Use merge tags to make emails feel personal
4. **Test timing:** Start with the suggested delays, adjust based on results
5. **Keep it valuable:** Each email should provide value, not just sell

## Next Steps

After setting up basic flows, consider:

1. **Email tracking** - Track opens and clicks (coming next)
2. **Segmentation** - Different flows for different user types
3. **A/B testing** - Test different subject lines and content
4. **Advanced triggers** - Add more trigger types (course completion, etc.)

---

## Support

Need help? Check the application logs or contact support.
