/**
 * Signup Form Component
 * Client-side form that handles user registration
 *
 * This is a "client component" (uses React hooks like useState)
 * while the main page is a "server component"
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Play, Loader2, CheckCircle2 } from 'lucide-react'

export function SignupForm() {
  // Form state
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      // Success!
      setSuccess(true)

      // Clear form
      setEmail('')
      setFirstName('')
      setLastName('')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Show success message
  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-sage/20 mb-4">
          <CheckCircle2 className="h-8 w-8 text-brand-forest" />
        </div>
        <h3 className="text-2xl font-crimson font-bold text-brand-forest">
          Check Your Email! 📧
        </h3>
        <p className="text-gray-700">
          We've sent your personal access link to your inbox.
        </p>
        <p className="text-sm text-gray-600">
          Can't find it? Check your spam folder or{' '}
          <button
            onClick={() => setSuccess(false)}
            className="text-brand-forest underline hover:text-brand-teal"
          >
            try again
          </button>
        </p>
      </div>
    )
  }

  // Show signup form
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <Input
          type="text"
          placeholder="Last Name (optional)"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full"
          disabled={isLoading}
        />
      </div>

      <div>
        <Input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full"
          required
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <Button
        type="submit"
        variant="accent"
        size="xl"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Signing You Up...
          </>
        ) : (
          <>
            <Play className="mr-2 h-5 w-5" />
            Get My Free Course
          </>
        )}
      </Button>

      <p className="text-xs text-gray-500 mt-4 text-center">
        No credit card required. Instant access to your course.
      </p>
    </form>
  )
}
