/**
 * Debug Flows Endpoint
 * Check flow configuration and pending executions
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get all flows
    const flows = await db.emailFlow.findMany({
      include: {
        steps: true
      }
    })

    // Get pending executions
    const pendingExecutions = await db.emailFlowExecution.findMany({
      where: {
        status: 'pending'
      },
      include: {
        flow: true,
        step: true
      },
      orderBy: {
        scheduledFor: 'asc'
      }
    })

    // Get recent executions (last 10)
    const recentExecutions = await db.emailFlowExecution.findMany({
      take: 10,
      include: {
        flow: true,
        step: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      flows: flows.map(f => ({
        id: f.id,
        name: f.name,
        trigger: f.trigger,
        enabled: f.enabled,
        stepCount: f.steps.length,
        enabledSteps: f.steps.filter(s => s.enabled).length,
        steps: f.steps.map(s => ({
          stepNumber: s.stepNumber,
          subject: s.subject,
          delayDays: s.delayDays,
          enabled: s.enabled
        }))
      })),
      pendingCount: pendingExecutions.length,
      pending: pendingExecutions.map(e => ({
        id: e.id,
        flowName: e.flow.name,
        stepSubject: e.step.subject,
        scheduledFor: e.scheduledFor,
        status: e.status
      })),
      recent: recentExecutions.map(e => ({
        flowName: e.flow.name,
        stepSubject: e.step.subject,
        status: e.status,
        createdAt: e.createdAt,
        sentAt: e.sentAt,
        error: e.error
      }))
    })
  } catch (error) {
    console.error('Debug flows error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
