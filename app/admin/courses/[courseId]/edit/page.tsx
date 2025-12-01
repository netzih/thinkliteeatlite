/**
 * Admin Course Edit Page
 * Comprehensive course builder with modules, lessons, and resources
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ChevronLeft, Plus, Edit2, Trash2, Save, X,
  GripVertical, Video, FileText, Upload, Loader2,
  ChevronDown, ChevronRight
} from 'lucide-react'

interface Course {
  id: string
  title: string
  slug: string
  description: string
  price: number
  published: boolean
  modules: Module[]
}

interface Module {
  id: string
  title: string
  description: string | null
  order: number
  lessons: Lesson[]
}

interface Lesson {
  id: string
  title: string
  description: string | null
  type: string
  videoUrl: string | null
  content: string | null
  duration: number | null
  order: number
  isFree: boolean
  resources: Resource[]
}

interface Resource {
  id: string
  title: string
  description: string | null
  fileType: string
  fileUrl: string
  fileSize: number | null
  order: number
}

export default function EditCoursePage({
  params
}: {
  params: { courseId: string }
}) {
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  // Module editing state
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null)
  const [newModuleTitle, setNewModuleTitle] = useState('')
  const [newModuleDescription, setNewModuleDescription] = useState('')
  const [isAddingModule, setIsAddingModule] = useState(false)

  // Lesson editing state
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [isAddingLesson, setIsAddingLesson] = useState<string | null>(null)

  // Lesson form state
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    type: 'video',
    videoUrl: '',
    content: '',
    duration: '',
    isFree: false
  })

  useEffect(() => {
    fetchCourse()
  }, [params.courseId])

  async function fetchCourse() {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/courses/${params.courseId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch course')
      }

      const data = await response.json()
      setCourse(data.course)

      // Expand all modules by default
      if (data.course.modules) {
        setExpandedModules(new Set(data.course.modules.map((m: Module) => m.id)))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load course')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAddModule() {
    if (!newModuleTitle.trim()) {
      setError('Module title is required')
      return
    }

    try {
      setIsSaving(true)
      setError('')

      const response = await fetch(`/api/admin/courses/${params.courseId}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newModuleTitle,
          description: newModuleDescription
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create module')
      }

      await fetchCourse()
      setNewModuleTitle('')
      setNewModuleDescription('')
      setIsAddingModule(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create module')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteModule(moduleId: string) {
    if (!confirm('Delete this module and all its lessons?')) return

    try {
      setIsSaving(true)
      const response = await fetch(`/api/admin/courses/${params.courseId}/modules/${moduleId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete module')
      }

      await fetchCourse()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete module')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleAddLesson(moduleId: string) {
    if (!lessonForm.title.trim()) {
      setError('Lesson title is required')
      return
    }

    try {
      setIsSaving(true)
      setError('')

      const response = await fetch(`/api/admin/courses/${params.courseId}/modules/${moduleId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...lessonForm,
          duration: lessonForm.duration ? parseInt(lessonForm.duration) : null
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create lesson')
      }

      await fetchCourse()
      setLessonForm({
        title: '',
        description: '',
        type: 'video',
        videoUrl: '',
        content: '',
        duration: '',
        isFree: false
      })
      setIsAddingLesson(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lesson')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteLesson(moduleId: string, lessonId: string) {
    if (!confirm('Delete this lesson?')) return

    try {
      setIsSaving(true)
      const response = await fetch(
        `/api/admin/courses/${params.courseId}/modules/${moduleId}/lessons/${lessonId}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        throw new Error('Failed to delete lesson')
      }

      await fetchCourse()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete lesson')
    } finally {
      setIsSaving(false)
    }
  }

  function toggleModule(moduleId: string) {
    setExpandedModules(prev => {
      const newSet = new Set(prev)
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId)
      } else {
        newSet.add(moduleId)
      }
      return newSet
    })
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
              Build your course content
            </p>
          </div>
          <Link href={`/courses/${course.slug}`} target="_blank">
            <Button variant="outline">
              Preview Course
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Course Details Summary */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Status:</span>
            <span className={`ml-2 font-medium ${course.published ? 'text-green-600' : 'text-gray-600'}`}>
              {course.published ? 'Published' : 'Draft'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Price:</span>
            <span className="ml-2 font-medium">
              {course.price === 0 ? 'Free' : `$${(course.price / 100).toFixed(2)}`}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Modules:</span>
            <span className="ml-2 font-medium">{course.modules.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Lessons:</span>
            <span className="ml-2 font-medium">
              {course.modules.reduce((sum, m) => sum + m.lessons.length, 0)}
            </span>
          </div>
        </div>
      </Card>

      {/* Modules & Lessons */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Course Content</h2>
          <Button
            onClick={() => setIsAddingModule(true)}
            className="bg-brand-forest hover:bg-brand-forest/90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Module
          </Button>
        </div>

        {/* Add Module Form */}
        {isAddingModule && (
          <Card className="p-6 bg-brand-sage/5">
            <h3 className="font-semibold text-gray-900 mb-4">New Module</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Module Title <span className="text-red-500">*</span>
                </label>
                <Input
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  placeholder="e.g., Introduction to Nutrition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-forest"
                  rows={3}
                  value={newModuleDescription}
                  onChange={(e) => setNewModuleDescription(e.target.value)}
                  placeholder="Brief description of this module..."
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleAddModule}
                  disabled={isSaving}
                  className="bg-brand-forest hover:bg-brand-forest/90 text-white"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Module
                </Button>
                <Button
                  onClick={() => {
                    setIsAddingModule(false)
                    setNewModuleTitle('')
                    setNewModuleDescription('')
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Module List */}
        {course.modules.length === 0 && !isAddingModule ? (
          <Card className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <FileText className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No modules yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start building your course by adding your first module
            </p>
            <Button
              onClick={() => setIsAddingModule(true)}
              className="bg-brand-forest hover:bg-brand-forest/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Module
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {course.modules.map((module, moduleIdx) => (
              <Card key={module.id} className="overflow-hidden">
                {/* Module Header */}
                <div className="bg-gray-50 p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {expandedModules.has(module.id) ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                      </button>
                      <GripVertical className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-brand-forest">
                            Module {moduleIdx + 1}
                          </span>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {module.title}
                          </h3>
                        </div>
                        {module.description && (
                          <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteModule(module.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Module Content (Lessons) */}
                {expandedModules.has(module.id) && (
                  <div className="p-4">
                    {/* Lessons List */}
                    {module.lessons.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {module.lessons.map((lesson, lessonIdx) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between p-3 bg-white border rounded-lg hover:border-brand-forest/50 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <GripVertical className="h-4 w-4 text-gray-400" />
                              {lesson.type === 'video' ? (
                                <Video className="h-4 w-4 text-brand-forest" />
                              ) : (
                                <FileText className="h-4 w-4 text-brand-forest" />
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">{lesson.title}</span>
                                  {lesson.isFree && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                      Free Preview
                                    </span>
                                  )}
                                </div>
                                {lesson.description && (
                                  <p className="text-sm text-gray-600">{lesson.description}</p>
                                )}
                              </div>
                              {lesson.duration && (
                                <span className="text-sm text-gray-500">
                                  {lesson.duration} min
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteLesson(module.id, lesson.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Lesson Form */}
                    {isAddingLesson === module.id ? (
                      <Card className="p-4 bg-blue-50/50 border-blue-200">
                        <h4 className="font-semibold text-gray-900 mb-4">New Lesson</h4>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Lesson Title <span className="text-red-500">*</span>
                              </label>
                              <Input
                                value={lessonForm.title}
                                onChange={(e) => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="e.g., Understanding Macronutrients"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type
                              </label>
                              <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-forest"
                                value={lessonForm.type}
                                onChange={(e) => setLessonForm(prev => ({ ...prev, type: e.target.value }))}
                              >
                                <option value="video">Video</option>
                                <option value="text">Text Content</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Description
                            </label>
                            <Input
                              value={lessonForm.description}
                              onChange={(e) => setLessonForm(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Brief description..."
                            />
                          </div>

                          {lessonForm.type === 'video' && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Video URL (YouTube or Vimeo embed)
                              </label>
                              <Input
                                value={lessonForm.videoUrl}
                                onChange={(e) => setLessonForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                                placeholder="https://www.youtube.com/embed/..."
                              />
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Duration (minutes)
                              </label>
                              <Input
                                type="number"
                                value={lessonForm.duration}
                                onChange={(e) => setLessonForm(prev => ({ ...prev, duration: e.target.value }))}
                                placeholder="0"
                              />
                            </div>
                            <div className="flex items-end">
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={lessonForm.isFree}
                                  onChange={(e) => setLessonForm(prev => ({ ...prev, isFree: e.target.checked }))}
                                  className="w-4 h-4 text-brand-forest border-gray-300 rounded focus:ring-brand-forest"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                  Free Preview Lesson
                                </span>
                              </label>
                            </div>
                          </div>

                          <div className="flex gap-3 pt-4 border-t">
                            <Button
                              onClick={() => handleAddLesson(module.id)}
                              disabled={isSaving}
                              className="bg-brand-forest hover:bg-brand-forest/90 text-white"
                            >
                              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                              Save Lesson
                            </Button>
                            <Button
                              onClick={() => {
                                setIsAddingLesson(null)
                                setLessonForm({
                                  title: '',
                                  description: '',
                                  type: 'video',
                                  videoUrl: '',
                                  content: '',
                                  duration: '',
                                  isFree: false
                                })
                              }}
                              variant="outline"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ) : (
                      <Button
                        onClick={() => setIsAddingLesson(module.id)}
                        variant="outline"
                        className="w-full border-dashed"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Lesson
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
