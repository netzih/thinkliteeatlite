/**
 * Email utility functions using Resend
 * Handles sending emails and tracking
 */

import { Resend } from 'resend'

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY)

export interface SendEmailParams {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Send an email via Resend
 */
export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  try {
    const data = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
      to,
      subject,
      html,
      text: text || stripHtml(html), // Generate plain text if not provided
    })

    return { success: true, data }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}

/**
 * Send welcome email with video access link
 */
export async function sendWelcomeEmail(
  email: string,
  firstName: string,
  accessToken: string
) {
  const videoUrl = `${process.env.NEXT_PUBLIC_APP_URL}/watch?token=${accessToken}`

  const subject = `Welcome to Think Lite Eat Lite! 🌱 Your Free Course Awaits`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Think Lite Eat Lite</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #2C2D2C;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 30px 0;
      background: linear-gradient(135deg, #2D5D4F 0%, #5A8A7A 100%);
      color: white;
      border-radius: 10px 10px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: bold;
    }
    .header p {
      margin: 10px 0 0 0;
      font-style: italic;
      opacity: 0.9;
    }
    .content {
      background: white;
      padding: 40px 30px;
      border: 2px solid #9BCBBB;
      border-top: none;
      border-radius: 0 0 10px 10px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
    }
    .cta-button {
      display: inline-block;
      padding: 16px 40px;
      background-color: #D4DD3C;
      color: #2C2D2C;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      font-size: 18px;
      margin: 20px 0;
      text-align: center;
    }
    .cta-button:hover {
      background-color: #c5ce35;
    }
    .video-link {
      background-color: #f8f9fa;
      padding: 15px;
      border-left: 4px solid #5A8A7A;
      margin: 20px 0;
      border-radius: 4px;
      font-size: 14px;
      word-break: break-all;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 14px;
    }
    .divider {
      height: 2px;
      background: linear-gradient(to right, #9BCBBB, #2D5D4F, #9BCBBB);
      margin: 30px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Think Lite<br>Eat Lite</h1>
    <p>Break Free from YoYo Dieting Forever</p>
  </div>

  <div class="content">
    <p class="greeting">Hi ${firstName || 'there'}! 👋</p>

    <p>Welcome to Think Lite Eat Lite! I'm so excited you're here.</p>

    <p>You've just taken the first step toward breaking free from the exhausting cycle of yo-yo dieting. And I'm here to support you every step of the way.</p>

    <div class="divider"></div>

    <p><strong>Your free 8-minute course is ready!</strong></p>

    <p>In this short video, you'll discover:</p>
    <ul>
      <li>Why traditional diets fail (and what works instead)</li>
      <li>The mindset shift that makes healthy eating effortless</li>
      <li>Simple strategies you can start using today</li>
    </ul>

    <center>
      <a href="${videoUrl}" class="cta-button">
        ▶️ Watch Your Free Course Now
      </a>
    </center>

    <p style="margin-top: 30px;">This link is personal to you, so feel free to bookmark it and come back anytime.</p>

    <div class="video-link">
      <strong>Your personal access link:</strong><br>
      <a href="${videoUrl}" style="color: #2D5D4F;">${videoUrl}</a>
    </div>

    <div class="divider"></div>

    <p><strong>What's next?</strong></p>

    <p>Over the next few days, I'll be sharing more insights and tips to help you on your journey. Keep an eye on your inbox!</p>

    <p>And if you ever have questions, just reply to this email. I read every message.</p>

    <p style="margin-top: 30px;">To your health and happiness,</p>
    <p><strong>Think Lite Eat Lite Team</strong></p>
  </div>

  <div class="footer">
    <p>© ${new Date().getFullYear()} Think Lite Eat Lite. All rights reserved.</p>
    <p>You're receiving this email because you signed up at ${process.env.NEXT_PUBLIC_APP_URL}</p>
  </div>
</body>
</html>
  `

  const text = `
Hi ${firstName || 'there'}!

Welcome to Think Lite Eat Lite! I'm so excited you're here.

You've just taken the first step toward breaking free from the exhausting cycle of yo-yo dieting.

YOUR FREE 8-MINUTE COURSE IS READY!

Watch now: ${videoUrl}

In this short video, you'll discover:
- Why traditional diets fail (and what works instead)
- The mindset shift that makes healthy eating effortless
- Simple strategies you can start using today

This link is personal to you, so feel free to bookmark it and come back anytime.

To your health and happiness,
Think Lite Eat Lite Team

---
© ${new Date().getFullYear()} Think Lite Eat Lite. All rights reserved.
  `

  return sendEmail({ to: email, subject, html, text })
}

/**
 * Strip HTML tags for plain text version
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export default resend
