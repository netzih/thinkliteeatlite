/**
 * Lesson Player Page
 * Displays lesson content with navigation and progress tracking
 * Requires user authentication and enrollment verification
 */

import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MarkCompleteButton } from '@/components/course/mark-complete-button'
import { ChevronLeft, ChevronRight, Download, FileText, Music, Image as ImageIcon, File } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getLesson(lessonId: string) {
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: true,
          lessons: {
            orderBy: { order: 'asc' }
          }
        }
      },
      resources: {
        orderBy: { order: 'asc' }
      }
    }
  })
  return lesson
}

async function checkEnrollment(userId: string, courseId: string) {
  const enrollment = await db.courseEnrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId
      }
    }
  })
  return enrollment
}

async function getLessonProgress(userId: string, lessonId: string) {
  const progress = await db.lessonProgress.findUnique({
    where: {
      userId_lessonId: {
        userId,
        lessonId
      }
    }
  })
  return progress
}

// Helper to get resource icon
function getResourceIcon(fileType: string) {
  switch (fileType) {
    case 'pdf':
    case 'document':
      return <FileText className="h-5 w-5" />
    case 'audio':
      return <Music className="h-5 w-5" />
    case 'image':
      return <ImageIcon className="h-5 w-5" />
    default:
      return <File className="h-5 w-5" />
  }
}

// Helper to format file size
function formatFileSize(bytes: number | null) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default async function LessonPlayerPage({
  params
}: {
  params: { slug: string; lessonId: string }
}) {
  // Check authentication
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'user') {
    redirect(`/login?callbackUrl=/courses/${params.slug}/lessons/${params.lessonId}`)
  }

  const lesson = await getLesson(params.lessonId)

  if (!lesson || lesson.module.course.slug !== params.slug) {
    notFound()
  }

  const course = lesson.module.course
  const currentModule = lesson.module

  // Check enrollment - deny access unless lesson is free or user is enrolled
  if (!lesson.isFree) {
    const enrollment = await checkEnrollment(session.user.id, course.id)
    if (!enrollment) {
      // Redirect to course detail page where they can enroll
      redirect(`/courses/${course.slug}`)
    }
  }

  // Get lesson progress
  const lessonProgress = await getLessonProgress(session.user.id, lesson.id)
  const isCompleted = lessonProgress?.completed || false

  // Find previous and next lessons
  const currentLessonIndex = currentModule.lessons.findIndex(l => l.id === lesson.id)
  const previousLesson = currentLessonIndex > 0 ? currentModule.lessons[currentLessonIndex - 1] : null
  const nextLesson = currentLessonIndex < currentModule.lessons.length - 1
    ? currentModule.lessons[currentLessonIndex + 1]
    : null

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-brand-sage/10">
      {/* Header */}
      <header className="border-b border-brand-sage/30 bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href={`/courses/${course.slug}`} className="flex items-center gap-2 text-brand-forest hover:text-brand-forest/80">
              <ChevronLeft className="h-5 w-5" />
              <span className="font-semibold">Back to Course</span>
            </Link>
            <h1 className="font-crimson text-xl font-bold text-brand-forest text-center flex-1">
              {course.title}
            </h1>
            <div className="w-32"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Lesson Title */}
        <div className="mb-6">
          <h2 className="text-3xl font-crimson font-bold text-brand-charcoal mb-2">
            {lesson.title}
          </h2>
          {lesson.description && (
            <p className="text-gray-600">{lesson.description}</p>
          )}
        </div>

        {/* Lesson Content */}
        <Card className="p-8 mb-6">
          {lesson.type === 'video' && lesson.videoUrl && (
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-6">
              {/* Video Player - Replace with actual embed */}
              {lesson.videoUrl.includes('youtube.com') || lesson.videoUrl.includes('youtu.be') ? (
                <iframe
                  src={lesson.videoUrl}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={lesson.title}
                />
              ) : lesson.videoUrl.includes('vimeo.com') ? (
                <iframe
                  src={lesson.videoUrl}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title={lesson.title}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <p className="mb-2">Video URL: {lesson.videoUrl}</p>
                    <p className="text-sm text-gray-400">Please embed a YouTube or Vimeo video</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {lesson.content && (
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          )}
        </Card>

        {/* Downloadable Resources */}
        {lesson.resources.length > 0 && (
          <Card className="p-6 mb-6">
            <h3 className="text-xl font-semibold text-brand-charcoal mb-4 flex items-center gap-2">
              <Download className="h-5 w-5" />
              Downloadable Resources
            </h3>
            <div className="space-y-3">
              {lesson.resources.map((resource) => (
                <div
                  key={resource.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-brand-forest">
                      {getResourceIcon(resource.fileType)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{resource.title}</h4>
                      {resource.description && (
                        <p className="text-sm text-gray-600">{resource.description}</p>
                      )}
                      {resource.fileSize && (
                        <p className="text-xs text-gray-500 mt-1">
                          {formatFileSize(resource.fileSize)}
                        </p>
                      )}
                    </div>
                  </div>
                  <a
                    href={resource.fileUrl}
                    download
                    className="ml-4"
                  >
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          {previousLesson ? (
            <Link href={`/courses/${course.slug}/lessons/${previousLesson.id}`}>
              <Button variant="outline">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous Lesson
              </Button>
            </Link>
          ) : (
            <div></div>
          )}

          <MarkCompleteButton
            lessonId={lesson.id}
            initialCompleted={isCompleted}
          />

          {nextLesson ? (
            <Link href={`/courses/${course.slug}/lessons/${nextLesson.id}`}>
              <Button className="bg-brand-forest hover:bg-brand-forest/90 text-white">
                Next Lesson
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          ) : (
            <div></div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-brand-charcoal text-white/80 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Think Lite Eat Lite. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
