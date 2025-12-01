/**
 * Admin Module API
 * DELETE: Delete a module and all its lessons
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { courseId: string; moduleId: string } }
) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify module exists and belongs to this course
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

    // Delete the module (lessons will be cascade deleted)
    await db.module.delete({
      where: { id: params.moduleId }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting module:', error)
    return NextResponse.json(
      { error: 'Failed to delete module' },
      { status: 500 }
    )
  }
}
