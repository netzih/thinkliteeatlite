/**
 * New Email Flow Page
 * Create a new automated email sequence
 */

import FlowForm from '@/components/admin/flow-form'

export default function NewFlowPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Email Flow</h1>
        <p className="text-gray-600 mt-1">
          Set up an automated email sequence
        </p>
      </div>

      <FlowForm />
    </div>
  )
}
