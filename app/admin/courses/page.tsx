/**
 * Admin Courses Management Page
 * List and manage all courses
 */

import Link from 'next/link'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, BookOpen, Eye, EyeOff } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getCourses() {
  const courses = await db.course.findMany({
    include: {
      modules: {
        include: {
          lessons: true
        }
      },
      _count: {
        select: { enrollments: true }
      }
    },
    orderBy: { order: 'asc' }
  })
  return courses
}

export default async function AdminCoursesPage() {
  const courses = await getCourses()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-600 mt-1">
            Manage your course library
          </p>
        </div>
        <Link href="/admin/courses/new">
          <Button className="bg-brand-forest hover:bg-brand-forest/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Course
          </Button>
        </Link>
      </div>

      {/* Courses List */}
      {courses.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No courses yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first course to get started
          </p>
          <Link href="/admin/courses/new">
            <Button className="bg-brand-forest hover:bg-brand-forest/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create First Course
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6">
          {courses.map((course) => {
            const lessonCount = course.modules.reduce((sum, m) => sum + m.lessons.length, 0)

            return (
              <Card key={course.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {course.title}
                      </h3>
                      {course.published ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Eye className="h-3 w-3 mr-1" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Draft
                        </span>
                      )}
                    </div>

                    {course.description && (
                      <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                    )}

                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div>
                        <span className="font-semibold">{course.modules.length}</span> module{course.modules.length !== 1 ? 's' : ''}
                      </div>
                      <div>
                        <span className="font-semibold">{lessonCount}</span> lesson{lessonCount !== 1 ? 's' : ''}
                      </div>
                      <div>
                        <span className="font-semibold">{course._count.enrollments}</span> enrollment{course._count.enrollments !== 1 ? 's' : ''}
                      </div>
                      <div>
                        {course.price === 0 ? (
                          <span className="text-brand-forest font-semibold">Free</span>
                        ) : (
                          <span className="text-brand-forest font-semibold">
                            ${(course.price / 100).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Link href={`/courses/${course.slug}`} target="_blank">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                    </Link>
                    <Link href={`/admin/courses/${course.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
