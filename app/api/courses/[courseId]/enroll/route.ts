/**
 * Course Enrollment API
 * POST: Enroll a user in a course
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { triggerFlow } from '@/lib/flows'

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    // Check user authentication
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch course
    const course = await db.course.findUnique({
      where: { id: params.courseId, published: true }
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found or not available' },
        { status: 404 }
      )
    }

    // Check if already enrolled
    const existingEnrollment = await db.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: params.courseId
        }
      }
    })

    if (existingEnrollment) {
      return NextResponse.json({
        success: true,
        message: 'Already enrolled',
        enrollment: existingEnrollment
      })
    }

    // Handle free courses - create enrollment immediately
    if (course.price === 0) {
      const enrollment = await db.courseEnrollment.create({
        data: {
          userId: session.user.id,
          courseId: params.courseId,
          progress: 0,
          completed: false
        }
      })

      // Trigger course enrollment email flows
      try {
        await triggerFlow(session.user.id, 'course_enrollment')
        console.log(`Triggered course_enrollment flows for user: ${session.user.id}`)
      } catch (flowError) {
        console.error('Error triggering enrollment flows:', flowError)
      }

      return NextResponse.json({
        success: true,
        message: 'Successfully enrolled',
        enrollment
      }, { status: 201 })
    }

    // Handle paid courses - redirect to payment (Stripe integration TBD)
    // For now, return error
    return NextResponse.json(
      { error: 'Paid course enrollment requires payment. This feature is coming soon.' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error enrolling in course:', error)
    return NextResponse.json(
      { error: 'Failed to enroll in course' },
      { status: 500 }
    )
  }
}
