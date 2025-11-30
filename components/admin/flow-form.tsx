'use client'

/**
 * Flow Form Component
 * Create and edit email flows
 */

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Trash2, Plus, Save, X, Tag } from 'lucide-react'
import JoditEditor from 'jodit-react'
import { AVAILABLE_MERGE_TAGS } from '@/lib/merge-tags'

interface FlowStep {
  id?: string
  stepNumber: number
  delayDays: number
  subject: string
  htmlContent: string
  enabled: boolean
}

interface FlowFormProps {
  flow?: {
    id: string
    name: string
    description: string | null
    trigger: string
    enabled: boolean
    steps: FlowStep[]
  }
}

const TRIGGERS = [
  { value: 'signup', label: 'User Signup' },
  { value: 'video_watch', label: 'Video Watched' },
]

export default function FlowForm({ flow }: FlowFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState(flow?.name || '')
  const [description, setDescription] = useState(flow?.description || '')
  const [trigger, setTrigger] = useState(flow?.trigger || 'signup')
  const [enabled, setEnabled] = useState(flow?.enabled ?? true)
  const [steps, setSteps] = useState<FlowStep[]>(
    flow?.steps || [
      {
        stepNumber: 1,
        delayDays: 0,
        subject: '',
        htmlContent: '',
        enabled: true
      }
    ]
  )

  // Jodit editors refs
  const editorsRef = useRef<any>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url = flow ? `/api/flows/${flow.id}` : '/api/flows'
      const method = flow ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          trigger,
          enabled,
          steps: flow ? undefined : steps // Only send steps on create
        })
      })

      if (!response.ok) throw new Error('Failed to save flow')

      const data = await response.json()

      // If editing, save steps separately
      if (flow) {
        // Delete old steps and create new ones
        // (In a production app, you'd want more sophisticated step management)
        await Promise.all(
          flow.steps.map(step =>
            fetch(`/api/flows/${flow.id}/steps/${step.id}`, { method: 'DELETE' })
          )
        )

        await Promise.all(
          steps.map(step =>
            fetch(`/api/flows/${flow.id}/steps`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(step)
            })
          )
        )
      }

      router.push('/admin/flows')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save flow')
    } finally {
      setLoading(false)
    }
  }

  const addStep = () => {
    setSteps([
      ...steps,
      {
        stepNumber: steps.length + 1,
        delayDays: steps.length,
        subject: '',
        htmlContent: '',
        enabled: true
      }
    ])
  }

  const removeStep = (index: number) => {
    if (steps.length === 1) return // Keep at least one step
    setSteps(steps.filter((_, i) => i !== index))
  }

  const updateStep = (index: number, field: keyof FlowStep, value: any) => {
    const newSteps = [...steps]
    newSteps[index] = { ...newSteps[index], [field]: value }
    setSteps(newSteps)
  }

  const insertMergeTag = (index: number, tag: string) => {
    const editor = editorsRef.current[index]
    if (editor && editor.value !== undefined) {
      editor.selection.insertHTML(tag)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Flow Details */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Flow Details</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Flow Name *
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Welcome Sequence"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this flow for?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trigger *
            </label>
            <select
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-forest"
              required
            >
              {TRIGGERS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="enabled"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-4 w-4 text-forest focus:ring-forest border-gray-300 rounded"
            />
            <label htmlFor="enabled" className="ml-2 block text-sm text-gray-900">
              Flow is active
            </label>
          </div>
        </div>
      </Card>

      {/* Email Steps */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Email Steps</h2>
          <Button type="button" onClick={addStep} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Step
          </Button>
        </div>

        {steps.map((step, index) => (
          <Card key={index} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-md font-semibold">Step {index + 1}</h3>
              {steps.length > 1 && (
                <Button
                  type="button"
                  onClick={() => removeStep(index)}
                  variant="ghost"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Send after (days) *
                </label>
                <Input
                  type="number"
                  min="0"
                  value={step.delayDays}
                  onChange={(e) => updateStep(index, 'delayDays', parseInt(e.target.value))}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  0 = immediately, 1 = next day, etc.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Line *
                </label>
                <Input
                  type="text"
                  value={step.subject}
                  onChange={(e) => updateStep(index, 'subject', e.target.value)}
                  placeholder="Email subject"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Email Content *
                  </label>
                  <div className="flex gap-1">
                    {AVAILABLE_MERGE_TAGS.slice(0, 4).map(({ tag }) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => insertMergeTag(index, tag)}
                        className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                        title={`Insert ${tag}`}
                      >
                        <Tag className="h-3 w-3 inline mr-1" />
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                <JoditEditor
                  ref={(el: any) => (editorsRef.current[index] = el)}
                  value={step.htmlContent}
                  config={{
                    readonly: false,
                    height: 300,
                    toolbar: true
                  }}
                  onBlur={(content) => updateStep(index, 'htmlContent', content)}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`step-enabled-${index}`}
                  checked={step.enabled}
                  onChange={(e) => updateStep(index, 'enabled', e.target.checked)}
                  className="h-4 w-4 text-forest focus:ring-forest border-gray-300 rounded"
                />
                <label htmlFor={`step-enabled-${index}`} className="ml-2 block text-sm text-gray-900">
                  Step is active
                </label>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={loading}
          className="bg-forest hover:bg-forest/90"
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : flow ? 'Update Flow' : 'Create Flow'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/flows')}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </form>
  )
}
