/**
 * Test Email Endpoint
 * Test if Resend is configured correctly
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { to } = await request.json()

    if (!to) {
      return NextResponse.json(
        { error: 'Email address required' },
        { status: 400 }
      )
    }

    // Check environment variables
    const apiKey = process.env.RESEND_API_KEY
    const fromEmail = process.env.FROM_EMAIL

    console.log('Environment check:', {
      hasApiKey: !!apiKey,
      apiKeyPrefix: apiKey?.substring(0, 10),
      fromEmail
    })

    // Send test email
    const result = await sendEmail({
      to,
      subject: 'Test Email from Think Lite Eat Lite',
      html: '<h1>Test Email</h1><p>If you receive this, Resend is working correctly!</p>',
      text: 'Test Email - If you receive this, Resend is working correctly!'
    })

    console.log('Send result:', result)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully',
        data: result.data
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        apiKeySet: !!apiKey,
        fromEmail
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
