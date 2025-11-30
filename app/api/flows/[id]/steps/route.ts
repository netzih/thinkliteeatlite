/**
 * Flow Steps API
 * Manage steps within an email flow
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { stripHtml } from '@/lib/email'

/**
 * POST /api/flows/[id]/steps
 * Add a new step to a flow
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { delayDays, subject, htmlContent, textContent, enabled } = await request.json()

    // Validation
    if (delayDays === undefined || !subject || !htmlContent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get the current max step number for this flow
    const maxStep = await db.emailFlowStep.findFirst({
      where: { flowId: params.id },
      orderBy: { stepNumber: 'desc' },
      select: { stepNumber: true }
    })

    const nextStepNumber = (maxStep?.stepNumber || 0) + 1

    // Create step
    const step = await db.emailFlowStep.create({
      data: {
        flowId: params.id,
        stepNumber: nextStepNumber,
        delayDays,
        subject,
        htmlContent,
        textContent: textContent || stripHtml(htmlContent),
        enabled: enabled ?? true
      }
    })

    return NextResponse.json({ step }, { status: 201 })
  } catch (error) {
    console.error('Create step error:', error)
    return NextResponse.json(
      { error: 'Failed to create step' },
      { status: 500 }
    )
  }
}
