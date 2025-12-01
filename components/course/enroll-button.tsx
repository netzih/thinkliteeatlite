/**
 * Course Enrollment Button
 * Client component to handle course enrollment
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface EnrollButtonProps {
  courseId: string
  courseSlug: string
  coursePrice: number
}

export function EnrollButton({ courseId, courseSlug, coursePrice }: EnrollButtonProps) {
  const router = useRouter()
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [error, setError] = useState('')

  async function handleEnroll() {
    try {
      setIsEnrolling(true)
      setError('')

      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to enroll')
      }

      // Refresh and redirect to course page
      router.refresh()
      router.push(`/courses/${courseSlug}`)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enroll')
      setIsEnrolling(false)
    }
  }

  return (
    <div>
      <Button
        onClick={handleEnroll}
        disabled={isEnrolling}
        size="lg"
        className="bg-white text-brand-forest hover:bg-white/90 font-semibold"
      >
        {isEnrolling ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Enrolling...
          </>
        ) : (
          coursePrice === 0 ? 'Enroll Now - It\'s Free!' : `Enroll Now - $${(coursePrice / 100).toFixed(2)}`
        )}
      </Button>

      {error && (
        <p className="text-red-200 text-sm mt-3">
          {error}
        </p>
      )}
    </div>
  )
}
