/**
 * Email Template Utilities
 * Wrap email content with customizable header and footer
 */

import { db } from '@/lib/db'

// Default templates
const DEFAULT_HEADER = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #2C2D2C;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .email-container {
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .email-header {
      text-align: center;
      padding: 30px 20px;
      background: linear-gradient(135deg, #2D5D4F 0%, #5A8A7A 100%);
      color: white;
    }
    .email-header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: bold;
    }
    .email-header p {
      margin: 10px 0 0 0;
      font-style: italic;
      opacity: 0.9;
      font-size: 16px;
    }
    .email-content {
      padding: 40px 30px;
    }
    .email-content p {
      margin: 0 0 15px 0;
    }
    .email-content h2 {
      color: #2D5D4F;
      margin: 25px 0 15px 0;
    }
    .email-content h3 {
      color: #5A8A7A;
      margin: 20px 0 10px 0;
    }
    .email-content ul, .email-content ol {
      margin: 15px 0;
      padding-left: 25px;
    }
    .email-content li {
      margin: 8px 0;
    }
    .email-content a {
      color: #2D5D4F;
      text-decoration: underline;
    }
    .email-content a:hover {
      color: #5A8A7A;
    }
    .cta-button {
      display: inline-block;
      padding: 16px 40px;
      background-color: #D4DD3C;
      color: #2C2D2C !important;
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
    .divider {
      height: 2px;
      background: linear-gradient(to right, #9BCBBB, #2D5D4F, #9BCBBB);
      margin: 30px 0;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>Think Lite<br>Eat Lite</h1>
      <p>Break Free from YoYo Dieting Forever</p>
    </div>
    <div class="email-content">
`

const DEFAULT_FOOTER = `
    </div>
    <div style="text-align: center; padding: 30px 20px; background-color: #f8f9fa; border-top: 2px solid #9BCBBB;">
      <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
        <strong>Think Lite Eat Lite</strong><br>
        Break Free from YoYo Dieting Forever
      </p>
      <p style="margin: 10px 0; font-size: 12px; color: #888;">
        © ${new Date().getFullYear()} Think Lite Eat Lite. All rights reserved.
      </p>
      <p style="margin: 10px 0; font-size: 12px; color: #888;">
        You're receiving this email because you signed up at Think Lite Eat Lite.
      </p>
      <p style="margin: 10px 0; font-size: 12px;">
        <a href="{{unsubscribeUrl}}" style="color: #2D5D4F; text-decoration: underline;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>
`

/**
 * Get email template header from database or default
 */
export async function getEmailHeader(): Promise<string> {
  try {
    const setting = await db.settings.findUnique({
      where: { key: 'email_header' }
    })
    return setting?.value || DEFAULT_HEADER
  } catch (error) {
    console.error('Error fetching email header:', error)
    return DEFAULT_HEADER
  }
}

/**
 * Get email template footer from database or default
 */
export async function getEmailFooter(): Promise<string> {
  try {
    const setting = await db.settings.findUnique({
      where: { key: 'email_footer' }
    })
    return setting?.value || DEFAULT_FOOTER
  } catch (error) {
    console.error('Error fetching email footer:', error)
    return DEFAULT_FOOTER
  }
}

/**
 * Wrap email content with header and footer
 */
export async function wrapEmailContent(content: string): Promise<string> {
  const header = await getEmailHeader()
  const footer = await getEmailFooter()
  return `${header}${content}${footer}`
}

/**
 * Update email template header
 */
export async function updateEmailHeader(html: string): Promise<void> {
  await db.settings.upsert({
    where: { key: 'email_header' },
    update: { value: html },
    create: { key: 'email_header', value: html }
  })
}

/**
 * Update email template footer
 */
export async function updateEmailFooter(html: string): Promise<void> {
  await db.settings.upsert({
    where: { key: 'email_footer' },
    update: { value: html },
    create: { key: 'email_footer', value: html }
  })
}

/**
 * Get both header and footer for editing
 */
export async function getEmailTemplates(): Promise<{ header: string; footer: string }> {
  const header = await getEmailHeader()
  const footer = await getEmailFooter()
  return { header, footer }
}

/**
 * Get default templates (for reset functionality)
 */
export function getDefaultTemplates(): { header: string; footer: string } {
  return {
    header: DEFAULT_HEADER,
    footer: DEFAULT_FOOTER
  }
}
