/**
 * Admin Modules API
 * POST: Create a new module
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description } = await request.json()

    if (!title) {
      return NextResponse.json(
        { error: 'Module title is required' },
        { status: 400 }
      )
    }

    // Check if course exists
    const course = await db.course.findUnique({
      where: { id: params.courseId }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Get the highest order number
    const lastModule = await db.module.findFirst({
      where: { courseId: params.courseId },
      orderBy: { order: 'desc' }
    })
    const nextOrder = (lastModule?.order || 0) + 1

    // Create the module
    const module = await db.module.create({
      data: {
        courseId: params.courseId,
        title,
        description: description || '',
        order: nextOrder
      }
    })

    return NextResponse.json(
      { success: true, module },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating module:', error)
    return NextResponse.json(
      { error: 'Failed to create module' },
      { status: 500 }
    )
  }
}
