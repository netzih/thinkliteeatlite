/**
 * Email Flows Management Page
 * List and manage automated email sequences
 */

import Link from 'next/link'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, Mail, Clock, Users, Power, PowerOff } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getFlows() {
  const flows = await db.emailFlow.findMany({
    include: {
      steps: {
        orderBy: { stepNumber: 'asc' }
      },
      _count: {
        select: {
          executions: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
  return flows
}

export default async function FlowsPage() {
  const flows = await getFlows()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Flows</h1>
          <p className="text-gray-600 mt-1">
            Automated email sequences triggered by user actions
          </p>
        </div>
        <Link href="/admin/flows/new">
          <Button className="bg-brand-forest hover:bg-brand-forest/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Flow
          </Button>
        </Link>
      </div>

      {/* Flows List */}
      {flows.length === 0 ? (
        <Card className="p-12 text-center">
          <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No email flows yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first automated email sequence to engage users
          </p>
          <Link href="/admin/flows/new">
            <Button className="bg-brand-forest hover:bg-brand-forest/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create First Flow
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6">
          {flows.map((flow) => (
            <Card key={flow.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {flow.name}
                    </h3>
                    {flow.enabled ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Power className="h-3 w-3 mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <PowerOff className="h-3 w-3 mr-1" />
                        Disabled
                      </span>
                    )}
                  </div>

                  {flow.description && (
                    <p className="text-gray-600 mb-4">{flow.description}</p>
                  )}

                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span className="capitalize">{flow.trigger.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span>{flow.steps.length} step{flow.steps.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{flow._count.executions} scheduled</span>
                    </div>
                  </div>

                  {/* Steps Preview */}
                  {flow.steps.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {flow.steps.slice(0, 3).map((step) => (
                        <div key={step.id} className="text-sm text-gray-600 flex items-center gap-2">
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                            Day {step.delayDays}
                          </span>
                          <span className="truncate">{step.subject}</span>
                          {!step.enabled && (
                            <span className="text-xs text-gray-400">(disabled)</span>
                          )}
                        </div>
                      ))}
                      {flow.steps.length > 3 && (
                        <div className="text-sm text-gray-400">
                          +{flow.steps.length - 3} more step{flow.steps.length - 3 !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Link href={`/admin/flows/${flow.id}/edit`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
