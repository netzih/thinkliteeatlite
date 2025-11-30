/**
 * Individual Step API
 * Update or delete a specific step
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { stripHtml } from '@/lib/email'

/**
 * PUT /api/flows/[id]/steps/[stepId]
 * Update a step
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; stepId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { delayDays, subject, htmlContent, textContent, enabled } = await request.json()

    const step = await db.emailFlowStep.update({
      where: { id: params.stepId },
      data: {
        delayDays,
        subject,
        htmlContent,
        textContent: textContent || (htmlContent ? stripHtml(htmlContent) : undefined),
        enabled
      }
    })

    return NextResponse.json({ step })
  } catch (error) {
    console.error('Update step error:', error)
    return NextResponse.json(
      { error: 'Failed to update step' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/flows/[id]/steps/[stepId]
 * Delete a step
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; stepId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await db.emailFlowStep.delete({
      where: { id: params.stepId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete step error:', error)
    return NextResponse.json(
      { error: 'Failed to delete step' },
      { status: 500 }
    )
  }
}
