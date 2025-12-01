/**
 * Mark Complete Button
 * Client component to handle marking lessons as complete
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2 } from 'lucide-react'

interface MarkCompleteButtonProps {
  lessonId: string
  initialCompleted?: boolean
}

export function MarkCompleteButton({ lessonId, initialCompleted = false }: MarkCompleteButtonProps) {
  const router = useRouter()
  const [isCompleted, setIsCompleted] = useState(initialCompleted)
  const [isLoading, setIsLoading] = useState(false)

  async function handleMarkComplete() {
    try {
      setIsLoading(true)

      const response = await fetch(`/api/lessons/${lessonId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completed: !isCompleted
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update progress')
      }

      const data = await response.json()
      setIsCompleted(!isCompleted)

      // Refresh the page to update any progress indicators
      router.refresh()
    } catch (error) {
      console.error('Error marking lesson complete:', error)
      alert('Failed to update progress. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleMarkComplete}
      disabled={isLoading}
      variant="outline"
      className={isCompleted
        ? "border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700"
        : "border-brand-forest text-brand-forest hover:bg-brand-forest hover:text-white"
      }
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <CheckCircle2 className="h-4 w-4 mr-2" />
      )}
      {isCompleted ? 'Completed ✓' : 'Mark as Complete'}
    </Button>
  )
}
