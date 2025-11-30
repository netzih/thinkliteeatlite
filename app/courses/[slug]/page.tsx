/**
 * Course Detail Page
 * Shows course overview and module list
 */

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Clock, PlayCircle, FileText, CheckCircle2, Lock } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getCourse(slug: string) {
  const course = await db.course.findUnique({
    where: { slug, published: true },
    include: {
      modules: {
        include: {
          lessons: {
            include: {
              resources: true
            },
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { order: 'asc' }
      }
    }
  })
  return course
}

// Helper to get lesson icon
function getLessonIcon(type: string) {
  switch (type) {
    case 'video':
      return <PlayCircle className="h-5 w-5" />
    case 'quiz':
      return <CheckCircle2 className="h-5 w-5" />
    default:
      return <FileText className="h-5 w-5" />
  }
}

export default async function CourseDetailPage({
  params
}: {
  params: { slug: string }
}) {
  const course = await getCourse(params.slug)

  if (!course) {
    notFound()
  }

  const totalLessons = course.modules.reduce((sum, module) => sum + module.lessons.length, 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-brand-sage/10">
      {/* Header */}
      <header className="border-b border-brand-sage/30 bg-white">
        <div className="container mx-auto px-4 py-6">
          <Link href="/courses">
            <h1 className="font-crimson text-3xl font-bold text-brand-forest text-center">
              Think Lite Eat Lite
            </h1>
          </Link>
        </div>
      </header>

      {/* Course Hero */}
      <section className="bg-brand-forest text-white py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <h2 className="text-4xl font-crimson font-bold mb-4">
              {course.title}
            </h2>
            {course.description && (
              <p className="text-lg text-white/90 mb-6">
                {course.description}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <span>{course.modules.length} Modules</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>{totalLessons} Lessons</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="container mx-auto px-4 py-12 max-w-4xl">
        <h3 className="text-2xl font-crimson font-bold text-brand-charcoal mb-6">
          Course Content
        </h3>

        <div className="space-y-4">
          {course.modules.map((module, moduleIndex) => (
            <Card key={module.id} className="overflow-hidden">
              {/* Module Header */}
              <div className="bg-gray-50 p-4 border-b">
                <h4 className="text-lg font-semibold text-brand-charcoal">
                  Module {moduleIndex + 1}: {module.title}
                </h4>
                {module.description && (
                  <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  {module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Lessons List */}
              <div className="divide-y">
                {module.lessons.map((lesson, lessonIndex) => (
                  <div key={lesson.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="text-brand-forest mt-1">
                          {getLessonIcon(lesson.type)}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">
                            Lesson {lessonIndex + 1}: {lesson.title}
                          </h5>
                          {lesson.description && (
                            <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                          )}
                          {lesson.duration && (
                            <p className="text-sm text-gray-500 mt-1">
                              {lesson.duration} min
                            </p>
                          )}
                          {lesson.resources.length > 0 && (
                            <p className="text-sm text-brand-forest mt-1">
                              📎 {lesson.resources.length} downloadable resource{lesson.resources.length !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Access Button */}
                      {lesson.isFree ? (
                        <Link href={`/courses/${course.slug}/lessons/${lesson.id}`}>
                          <Button size="sm" variant="outline">
                            Start Free
                          </Button>
                        </Link>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-400">
                          <Lock className="h-4 w-4" />
                          <span className="text-sm">Locked</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Enroll CTA */}
        {course.price === 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              This course is completely free! Start learning today.
            </p>
            <Button size="lg" className="bg-brand-forest hover:bg-brand-forest/90 text-white">
              Start Course
            </Button>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-brand-charcoal text-white/80 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Think Lite Eat Lite. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
