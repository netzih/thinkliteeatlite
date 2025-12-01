/**
 * Lesson Progress API
 * POST: Mark lesson as complete and update course progress
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { triggerFlow } from '@/lib/flows'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    // Check user authentication
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { completed, watchTime } = await request.json()

    // Get lesson and verify it exists
    const lesson = await db.lesson.findUnique({
      where: { id: params.lessonId },
      include: {
        module: {
          include: {
            course: {
              include: {
                modules: {
                  include: {
                    lessons: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    const course = lesson.module.course

    // Verify user is enrolled in the course
    const enrollment = await db.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: course.id
        }
      }
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Not enrolled in this course' },
        { status: 403 }
      )
    }

    // Upsert lesson progress
    const lessonProgress = await db.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: params.lessonId
        }
      },
      update: {
        completed: completed ?? undefined,
        completedAt: completed ? new Date() : undefined,
        watchTime: watchTime ?? undefined
      },
      create: {
        userId: session.user.id,
        lessonId: params.lessonId,
        completed: completed || false,
        completedAt: completed ? new Date() : null,
        watchTime: watchTime || 0
      }
    })

    // Calculate overall course progress
    const totalLessons = course.modules.reduce(
      (sum, module) => sum + module.lessons.length,
      0
    )

    // Count completed lessons for this user in this course
    const completedLessons = await db.lessonProgress.count({
      where: {
        userId: session.user.id,
        completed: true,
        lesson: {
          module: {
            courseId: course.id
          }
        }
      }
    })

    // Calculate progress percentage
    const progressPercentage = totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0

    // Update course enrollment progress
    const wasCompleted = enrollment.completed
    await db.courseEnrollment.update({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: course.id
        }
      },
      data: {
        progress: progressPercentage,
        completed: progressPercentage === 100,
        completedAt: progressPercentage === 100 ? new Date() : null
      }
    })

    // Trigger lesson completion flow
    if (completed) {
      try {
        await triggerFlow(session.user.id, 'lesson_completion')
        console.log(`Triggered lesson_completion flows for user: ${session.user.id}`)
      } catch (flowError) {
        console.error('Error triggering lesson completion flows:', flowError)
      }
    }

    // Trigger course completion flow (only once when course is completed)
    if (progressPercentage === 100 && !wasCompleted) {
      try {
        await triggerFlow(session.user.id, 'course_completion')
        console.log(`Triggered course_completion flows for user: ${session.user.id}`)
      } catch (flowError) {
        console.error('Error triggering course completion flows:', flowError)
      }
    }

    return NextResponse.json({
      success: true,
      lessonProgress,
      courseProgress: {
        percentage: progressPercentage,
        completed: progressPercentage === 100,
        lessonsCompleted: completedLessons,
        totalLessons
      }
    })

  } catch (error) {
    console.error('Error updating lesson progress:', error)
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    )
  }
}
