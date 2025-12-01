/**
 * Admin Course Enrollment API
 * DELETE: Remove a user from the course
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { courseId: string; enrollmentId: string } }
) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify enrollment exists and belongs to this course
    const enrollment = await db.courseEnrollment.findUnique({
      where: { id: params.enrollmentId }
    })

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
    }

    if (enrollment.courseId !== params.courseId) {
      return NextResponse.json({ error: 'Enrollment does not belong to this course' }, { status: 400 })
    }

    // Delete the enrollment
    await db.courseEnrollment.delete({
      where: { id: params.enrollmentId }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting enrollment:', error)
    return NextResponse.json(
      { error: 'Failed to delete enrollment' },
      { status: 500 }
    )
  }
}
