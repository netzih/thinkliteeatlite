/**
 * Admin Lesson API
 * DELETE: Delete a lesson
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { courseId: string; moduleId: string; lessonId: string } }
) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify lesson exists and belongs to the correct module
    const lesson = await db.lesson.findUnique({
      where: { id: params.lessonId },
      include: { module: true }
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    if (lesson.moduleId !== params.moduleId) {
      return NextResponse.json(
        { error: 'Lesson does not belong to this module' },
        { status: 400 }
      )
    }

    if (lesson.module.courseId !== params.courseId) {
      return NextResponse.json(
        { error: 'Module does not belong to this course' },
        { status: 400 }
      )
    }

    // Delete the lesson
    await db.lesson.delete({
      where: { id: params.lessonId }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting lesson:', error)
    return NextResponse.json(
      { error: 'Failed to delete lesson' },
      { status: 500 }
    )
  }
}
