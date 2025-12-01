/**
 * Admin Course Edit Page
 * Edit course details and manage modules/lessons
 */

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Plus, Edit, Trash2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getCourse(courseId: string) {
  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        include: {
          lessons: {
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { order: 'asc' }
      }
    }
  })
  return course
}

export default async function EditCoursePage({
  params
}: {
  params: { courseId: string }
}) {
  const course = await getCourse(params.courseId)

  if (!course) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/admin/courses" className="inline-flex items-center text-brand-forest hover:text-brand-forest/80 mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Courses
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
            <p className="text-gray-600 mt-1">
              Edit course details and content
            </p>
          </div>
          <Link href={`/courses/${course.slug}`} target="_blank">
            <Button variant="outline">
              Preview Course
            </Button>
          </Link>
        </div>
      </div>

      {/* Course Details */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Slug:</span>
            <span className="ml-2 font-medium">/courses/{course.slug}</span>
          </div>
          <div>
            <span className="text-gray-600">Price:</span>
            <span className="ml-2 font-medium">
              {course.price === 0 ? 'Free' : `$${(course.price / 100).toFixed(2)}`}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Status:</span>
            <span className={`ml-2 font-medium ${course.published ? 'text-green-600' : 'text-gray-600'}`}>
              {course.published ? 'Published' : 'Draft'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Modules:</span>
            <span className="ml-2 font-medium">{course.modules.length}</span>
          </div>
        </div>
        {course.description && (
          <div className="mt-4 pt-4 border-t">
            <span className="text-gray-600 text-sm">Description:</span>
            <p className="mt-1 text-gray-900">{course.description}</p>
          </div>
        )}
      </Card>

      {/* Coming Soon Notice */}
      <Card className="p-8 text-center bg-gradient-to-r from-brand-sage/10 to-brand-teal/10">
        <h2 className="text-2xl font-crimson font-bold text-brand-forest mb-3">
          Course Builder Coming Soon
        </h2>
        <p className="text-gray-600 mb-6">
          The visual course builder for adding modules, lessons, videos, and resources is currently under development.
        </p>
        <div className="space-y-2 text-sm text-gray-600">
          <p>✓ Course created successfully</p>
          <p>✓ Access control system in place</p>
          <p>⏳ Module & lesson builder (next phase)</p>
        </div>
      </Card>

      {/* Modules List (if any exist) */}
      {course.modules.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Modules</h2>
          </div>

          {course.modules.map((module, idx) => (
            <Card key={module.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-semibold text-brand-forest">
                      Module {idx + 1}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {module.title}
                    </h3>
                  </div>
                  {module.description && (
                    <p className="text-gray-600 mb-3">{module.description}</p>
                  )}
                  <div className="text-sm text-gray-500">
                    {module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
