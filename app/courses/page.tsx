/**
 * Courses List Page
 * Shows all available courses
 */

import Link from 'next/link'
import { db } from '@/lib/db'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Clock, CheckCircle2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getCourses() {
  const courses = await db.course.findMany({
    where: { published: true },
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

export default async function CoursesPage() {
  const courses = await getCourses()

  // Calculate total lessons for each course
  const coursesWithStats = courses.map(course => ({
    ...course,
    lessonCount: course.modules.reduce((sum, module) => sum + module.lessons.length, 0)
  }))

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-brand-sage/10">
      {/* Header */}
      <header className="border-b border-brand-sage/30 bg-white">
        <div className="container mx-auto px-4 py-6">
          <Link href="/">
            <h1 className="font-crimson text-3xl font-bold text-brand-forest text-center">
              Think Lite Eat Lite
            </h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-crimson font-bold text-brand-charcoal mb-4">
            Your Course Library
          </h2>
          <p className="text-lg text-gray-600">
            Start your journey to a healthier relationship with food
          </p>
        </div>

        {/* Courses Grid */}
        {coursesWithStats.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No courses available yet
            </h3>
            <p className="text-gray-600">
              Check back soon for new courses!
            </p>
          </Card>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {coursesWithStats.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Thumbnail */}
                {course.thumbnail && (
                  <div className="aspect-video bg-gray-200 relative">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-crimson font-bold text-brand-charcoal mb-2">
                    {course.title}
                  </h3>

                  {course.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {course.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{course.modules.length} modules</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.lessonCount} lessons</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    {course.price === 0 ? (
                      <span className="text-brand-forest font-semibold">Free</span>
                    ) : (
                      <span className="text-brand-forest font-semibold">
                        ${(course.price / 100).toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* CTA */}
                  <Link href={`/courses/${course.slug}`}>
                    <Button className="w-full bg-brand-forest hover:bg-brand-forest/90 text-white">
                      View Course
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
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
