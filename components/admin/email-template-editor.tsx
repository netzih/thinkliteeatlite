'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Save, RotateCcw, Eye } from 'lucide-react'
import dynamic from 'next/dynamic'

const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false })

export default function EmailTemplateEditor() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [header, setHeader] = useState('')
  const [footer, setFooter] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const headerEditorRef = useRef<any>(null)
  const footerEditorRef = useRef<any>(null)

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const response = await fetch('/api/admin/settings/email-template')
        if (!response.ok) throw new Error('Failed to fetch templates')

        const data = await response.json()
        setHeader(data.templates.header)
        setFooter(data.templates.footer)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load templates')
      } finally {
        setLoading(false)
      }
    }

    fetchTemplates()
  }, [])

  const editorConfig = useMemo(() => ({
    readonly: false,
    placeholder: 'Enter HTML code...',
    minHeight: 400,
    width: '100%',
    useSearch: false,
    spellcheck: false,
    showCharsCounter: false,
    showWordsCounter: false,
    showXPathInStatusbar: false,
    buttons: [
      'source', '|',
      'bold', 'italic', 'underline', '|',
      'ul', 'ol', '|',
      'font', 'fontsize', 'brush', '|',
      'paragraph', 'h1', 'h2', 'h3', '|',
      'link', 'image', '|',
      'align', '|',
      'undo', 'redo', '|',
      'fullsize'
    ],
  }), [])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/admin/settings/email-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ header, footer })
      })

      if (!response.ok) throw new Error('Failed to save templates')

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save templates')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset to default templates? This will overwrite your current customizations.')) {
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/settings/email-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reset: true })
      })

      if (!response.ok) throw new Error('Failed to reset templates')

      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset templates')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">Loading templates...</div>
    )
  }

  function getPreviewHtml() {
    if (!showPreview) return ''
    const samplePart1 = '<div style="padding: 20px;"><h2>Sample Email Content</h2>'
    const samplePart2 = '<p>This is what your email content will look like with the custom header and footer.</p></div>'
    return header + samplePart1 + samplePart2 + footer
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>The header wraps around the beginning of every email</li>
          <li>The footer wraps around the end of every email</li>
          <li>Your email content from campaigns and flows appears between them</li>
          <li>You can use HTML CSS and merge tags</li>
          <li>Changes apply to all future emails automatically</li>
        </ul>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold">Email Header</h2>
            <p className="text-sm text-gray-600">HTML that appears at the top of every email</p>
          </div>
        </div>

        <div className="w-full">
          <JoditEditor
            ref={headerEditorRef}
            value={header}
            config={editorConfig}
            onBlur={(content) => setHeader(content)}
          />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold">Email Footer</h2>
            <p className="text-sm text-gray-600">HTML that appears at the bottom of every email</p>
          </div>
        </div>

        <div className="w-full">
          <JoditEditor
            ref={footerEditorRef}
            value={footer}
            config={editorConfig}
            onBlur={(content) => setFooter(content)}
          />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Preview</h2>
          <Button
            onClick={() => setShowPreview(!showPreview)}
            variant="outline"
            size="sm"
          >
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Hide' : 'Show'} Preview
          </Button>
        </div>

        {showPreview && (
          <div className="border rounded p-4 bg-gray-50 overflow-auto max-h-96">
            <div dangerouslySetInnerHTML={{ __html: getPreviewHtml() }} />
          </div>
        )}
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
          Templates saved successfully!
        </div>
      )}

      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-forest hover:bg-forest/90"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Templates'}
        </Button>

        <Button
          onClick={handleReset}
          disabled={saving}
          variant="outline"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
      </div>
    </div>
  )
}
