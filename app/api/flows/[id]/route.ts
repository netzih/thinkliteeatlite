/**
 * Individual Email Flow API
 * Get, update, or delete a specific flow
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'

/**
 * GET /api/flows/[id]
 * Get a specific flow with its steps
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const flow = await db.emailFlow.findUnique({
      where: { id: params.id },
      include: {
        steps: {
          orderBy: { stepNumber: 'asc' }
        },
        _count: {
          select: { executions: true }
        }
      }
    })

    if (!flow) {
      return NextResponse.json({ error: 'Flow not found' }, { status: 404 })
    }

    return NextResponse.json({ flow })
  } catch (error) {
    console.error('Get flow error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch flow' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/flows/[id]
 * Update a flow
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, trigger, enabled } = await request.json()

    const flow = await db.emailFlow.update({
      where: { id: params.id },
      data: {
        name,
        description,
        trigger,
        enabled
      },
      include: {
        steps: {
          orderBy: { stepNumber: 'asc' }
        }
      }
    })

    return NextResponse.json({ flow })
  } catch (error) {
    console.error('Update flow error:', error)
    return NextResponse.json(
      { error: 'Failed to update flow' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/flows/[id]
 * Delete a flow
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await db.emailFlow.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete flow error:', error)
    return NextResponse.json(
      { error: 'Failed to delete flow' },
      { status: 500 }
    )
  }
}
