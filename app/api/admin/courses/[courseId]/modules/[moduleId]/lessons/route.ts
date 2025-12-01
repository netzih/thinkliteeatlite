/**
 * Admin Lessons API
 * POST: Create a new lesson
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string; moduleId: string } }
) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      title,
      description,
      type,
      videoUrl,
      content,
      duration,
      isFree
    } = await request.json()

    if (!title) {
      return NextResponse.json(
        { error: 'Lesson title is required' },
        { status: 400 }
      )
    }

    // Verify module exists and belongs to course
    const module = await db.module.findUnique({
      where: { id: params.moduleId }
    })

    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    if (module.courseId !== params.courseId) {
      return NextResponse.json(
        { error: 'Module does not belong to this course' },
        { status: 400 }
      )
    }

    // Get the highest order number
    const lastLesson = await db.lesson.findFirst({
      where: { moduleId: params.moduleId },
      orderBy: { order: 'desc' }
    })
    const nextOrder = (lastLesson?.order || 0) + 1

    // Create the lesson
    const lesson = await db.lesson.create({
      data: {
        moduleId: params.moduleId,
        title,
        description: description || '',
        type: type || 'video',
        videoUrl: videoUrl || null,
        content: content || null,
        duration: duration || null,
        isFree: isFree || false,
        order: nextOrder
      }
    })

    return NextResponse.json(
      { success: true, lesson },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating lesson:', error)
    return NextResponse.json(
      { error: 'Failed to create lesson' },
      { status: 500 }
    )
  }
}
