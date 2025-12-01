/**
 * Email Template Settings API
 * GET: Retrieve current email templates
 * POST: Update email templates
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import {
  getEmailTemplates,
  updateEmailHeader,
  updateEmailFooter,
  getDefaultTemplates
} from '@/lib/email-template'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const templates = await getEmailTemplates()
    const defaults = getDefaultTemplates()

    return NextResponse.json({
      templates,
      defaults
    })
  } catch (error) {
    console.error('Error fetching email templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { header, footer, reset } = await request.json()

    // If reset requested, use defaults
    if (reset) {
      const defaults = getDefaultTemplates()
      await updateEmailHeader(defaults.header)
      await updateEmailFooter(defaults.footer)

      return NextResponse.json({
        success: true,
        message: 'Templates reset to defaults'
      })
    }

    // Update templates
    if (header !== undefined) {
      await updateEmailHeader(header)
    }

    if (footer !== undefined) {
      await updateEmailFooter(footer)
    }

    return NextResponse.json({
      success: true,
      message: 'Templates updated successfully'
    })
  } catch (error) {
    console.error('Error updating email templates:', error)
    return NextResponse.json(
      { error: 'Failed to update templates' },
      { status: 500 }
    )
  }
}
