/**
 * Admin Course Enrollments Management Page
 * Manage user enrollments for a specific course
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ChevronLeft, UserPlus, Trash2, Search, Loader2 } from 'lucide-react'

interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
}

interface Enrollment {
  id: string
  userId: string
  progress: number
  completed: boolean
  enrolledAt: string
  user: User
}

interface Course {
  id: string
  title: string
  slug: string
}

export default function CourseEnrollmentsPage({
  params
}: {
  params: { courseId: string }
}) {
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [params.courseId])

  async function fetchData() {
    try {
      setIsLoading(true)

      // Fetch course details and enrollments
      const [courseRes, usersRes] = await Promise.all([
        fetch(`/api/admin/courses/${params.courseId}/enrollments`),
        fetch('/api/admin/users')
      ])

      if (!courseRes.ok) {
        throw new Error('Failed to fetch course data')
      }

      const courseData = await courseRes.json()
      const usersData = await usersRes.json()

      setCourse(courseData.course)
      setEnrollments(courseData.enrollments)
      setAllUsers(usersData.users || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAddEnrollment() {
    if (!selectedUserId) {
      setError('Please select a user')
      return
    }

    try {
      setIsAddingUser(true)
      setError('')

      const response = await fetch(`/api/admin/courses/${params.courseId}/enrollments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUserId })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add enrollment')
      }

      // Refresh data
      await fetchData()
      setSelectedUserId('')
      setSearchQuery('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add user')
    } finally {
      setIsAddingUser(false)
    }
  }

  async function handleRemoveEnrollment(enrollmentId: string, userName: string) {
    if (!confirm(`Remove ${userName} from this course?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/courses/${params.courseId}/enrollments/${enrollmentId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to remove enrollment')
      }

      // Refresh data
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove user')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand-forest" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Course not found</p>
      </div>
    )
  }

  // Filter users who are not enrolled
  const enrolledUserIds = new Set(enrollments.map(e => e.userId))
  const availableUsers = allUsers.filter(user => !enrolledUserIds.has(user.id))

  // Filter available users by search query
  const filteredUsers = availableUsers.filter(user => {
    const query = searchQuery.toLowerCase()
    return (
      user.email.toLowerCase().includes(query) ||
      user.firstName?.toLowerCase().includes(query) ||
      user.lastName?.toLowerCase().includes(query)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/admin/courses" className="inline-flex items-center text-brand-forest hover:text-brand-forest/80 mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Courses
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
        <p className="text-gray-600 mt-1">
          Manage course enrollments
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Add User Section */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Add User to Course
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Users
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {searchQuery && (
            <div className="border rounded-lg max-h-60 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No users found
                </div>
              ) : (
                <div className="divide-y">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        setSelectedUserId(user.id)
                        setSearchQuery('')
                      }}
                      className="w-full p-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedUserId && (
            <div className="flex items-center gap-3">
              <div className="flex-1 p-3 bg-brand-sage/10 border border-brand-sage/30 rounded-lg">
                {(() => {
                  const user = allUsers.find(u => u.id === selectedUserId)
                  return (
                    <>
                      <div className="font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </div>
                      <div className="text-sm text-gray-600">{user?.email}</div>
                    </>
                  )
                })()}
              </div>
              <Button
                onClick={handleAddEnrollment}
                disabled={isAddingUser}
                className="bg-brand-forest hover:bg-brand-forest/90 text-white"
              >
                {isAddingUser ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedUserId('')}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Enrolled Users List */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Enrolled Users ({enrollments.length})
        </h2>

        {enrollments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No users enrolled yet
          </div>
        ) : (
          <div className="space-y-3">
            {enrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {enrollment.user.firstName} {enrollment.user.lastName}
                  </div>
                  <div className="text-sm text-gray-600">{enrollment.user.email}</div>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <div className="text-gray-600">
                      Progress: <span className="font-semibold">{enrollment.progress}%</span>
                    </div>
                    {enrollment.completed && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        Completed
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveEnrollment(
                    enrollment.id,
                    `${enrollment.user.firstName} ${enrollment.user.lastName}`
                  )}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
