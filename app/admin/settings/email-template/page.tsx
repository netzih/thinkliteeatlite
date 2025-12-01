/**
 * Email Template Settings Page
 * Edit global email header and footer
 */

import { Suspense } from 'react'
import EmailTemplateEditor from '@/components/admin/email-template-editor'

export default function EmailTemplatePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Email Template Settings</h1>
        <p className="text-gray-600 mt-2">
          Customize the header and footer that wraps all outgoing emails (campaigns and automated flows)
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <EmailTemplateEditor />
      </Suspense>
    </div>
  )
}
