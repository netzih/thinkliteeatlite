/**
 * Email Composer Component
 * WYSIWYG editor with Jodit
 */

'use client'

import { useState, useRef, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Send, Eye } from 'lucide-react'

// Dynamically import Jodit to avoid SSR issues
const JoditEditor = dynamic(() => import('jodit-react'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded animate-pulse" />
})

interface Group {
  id: string
  name: string
  userCount: number
}

interface EmailComposerProps {
  groups: Group[]
}

export default function EmailComposer({ groups }: EmailComposerProps) {
  const editor = useRef(null)
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [isSending, setIsSending] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Calculate total recipients
  const totalRecipients = useMemo(() => {
    return groups
      .filter(g => selectedGroups.includes(g.id))
      .reduce((sum, g) => sum + g.userCount, 0)
  }, [groups, selectedGroups])

  // Jodit config
  const config = useMemo(() => ({
    readonly: false,
    placeholder: 'Start writing your email...',
    minHeight: 400,
    buttons: [
      'bold', 'italic', 'underline', '|',
      'ul', 'ol', '|',
      'font', 'fontsize', '|',
      'paragraph', '|',
      'link', 'image', '|',
      'align', '|',
      'undo', 'redo'
    ],
    removeButtons: ['source', 'fullsize', 'about'],
    showCharsCounter: false,
    showWordsCounter: false,
    showXPathInStatusbar: false,
  }), [])

  // Toggle group selection
  const toggleGroup = (groupId: string) => {
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }

  // Send email
  const handleSend = async () => {
    setError('')
    setSuccess('')

    // Validation
    if (!subject.trim()) {
      setError('Please enter a subject')
      return
    }
    if (!content.trim()) {
      setError('Please write your email content')
      return
    }
    if (selectedGroups.length === 0) {
      setError('Please select at least one group')
      return
    }

    setIsSending(true)

    try {
      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          htmlContent: content,
          groupIds: selectedGroups
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email')
      }

      setSuccess(`Email sent successfully to ${data.recipientCount} recipients!`)
      // Reset form
      setSubject('')
      setContent('')
      setSelectedGroups([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send email')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Editor */}
      <div className="lg:col-span-2 space-y-6">
        {/* Subject */}
        <div className="bg-white shadow rounded-lg p-6">
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
            Subject Line
          </label>
          <Input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter email subject..."
            className="text-lg"
          />
        </div>

        {/* Content Editor */}
        <div className="bg-white shadow rounded-lg p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Content
          </label>
          <JoditEditor
            ref={editor}
            value={content}
            config={config}
            onBlur={newContent => setContent(newContent)}
            onChange={newContent => setContent(newContent)}
          />
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
            <div className="border rounded-lg p-4">
              <div className="mb-4">
                <strong>Subject:</strong> {subject}
              </div>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            {success}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Recipients */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            Select Recipients
          </h3>
          <div className="space-y-3">
            {groups.map(group => (
              <label
                key={group.id}
                className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedGroups.includes(group.id)}
                  onChange={() => toggleGroup(group.id)}
                  className="h-4 w-4 text-brand-forest focus:ring-brand-forest border-gray-300 rounded"
                />
                <span className="ml-3 flex-1">
                  <span className="block text-sm font-medium text-gray-900">
                    {group.name}
                  </span>
                  <span className="block text-xs text-gray-500">
                    {group.userCount} {group.userCount === 1 ? 'user' : 'users'}
                  </span>
                </span>
              </label>
            ))}
          </div>

          {selectedGroups.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-700">
                <strong>Total Recipients:</strong> {totalRecipients}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white shadow rounded-lg p-6 space-y-3">
          <Button
            onClick={() => setShowPreview(!showPreview)}
            variant="outline"
            className="w-full"
          >
            <Eye className="mr-2 h-4 w-4" />
            {showPreview ? 'Hide' : 'Show'} Preview
          </Button>

          <Button
            onClick={handleSend}
            disabled={isSending}
            className="w-full"
            size="lg"
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Send Email
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
