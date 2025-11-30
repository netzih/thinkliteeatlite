/**
 * Email Flows API
 * Manage automated email sequences
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'

/**
 * GET /api/flows
 * List all email flows
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const flows = await db.emailFlow.findMany({
      include: {
        steps: {
          orderBy: { stepNumber: 'asc' }
        },
        _count: {
          select: { executions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ flows })
  } catch (error) {
    console.error('Get flows error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch flows' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/flows
 * Create a new email flow
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, trigger, enabled, steps } = await request.json()

    // Validation
    if (!name || !trigger) {
      return NextResponse.json(
        { error: 'Name and trigger are required' },
        { status: 400 }
      )
    }

    // Create flow with steps
    const flow = await db.emailFlow.create({
      data: {
        name,
        description: description || null,
        trigger,
        enabled: enabled ?? true,
        steps: steps ? {
          create: steps.map((step: any, index: number) => ({
            stepNumber: index + 1,
            delayDays: step.delayDays,
            subject: step.subject,
            htmlContent: step.htmlContent,
            textContent: step.textContent || step.htmlContent.replace(/<[^>]*>/g, ''),
            enabled: step.enabled ?? true
          }))
        } : undefined
      },
      include: {
        steps: {
          orderBy: { stepNumber: 'asc' }
        }
      }
    })

    return NextResponse.json({ flow }, { status: 201 })
  } catch (error) {
    console.error('Create flow error:', error)
    return NextResponse.json(
      { error: 'Failed to create flow' },
      { status: 500 }
    )
  }
}
