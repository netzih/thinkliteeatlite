/**
 * Edit Email Flow Page
 * Edit an existing automated email sequence
 */

import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import FlowForm from '@/components/admin/flow-form'

export const dynamic = 'force-dynamic'

async function getFlow(id: string) {
  const flow = await db.emailFlow.findUnique({
    where: { id },
    include: {
      steps: {
        orderBy: { stepNumber: 'asc' }
      }
    }
  })

  return flow
}

export default async function EditFlowPage({
  params
}: {
  params: { id: string }
}) {
  const flow = await getFlow(params.id)

  if (!flow) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Email Flow</h1>
        <p className="text-gray-600 mt-1">
          Update your automated email sequence
        </p>
      </div>

      <FlowForm flow={flow} />
    </div>
  )
}
