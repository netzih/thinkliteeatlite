/**
 * Email History Page
 * Shows all sent email campaigns
 */

import { db } from '@/lib/db'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { calculatePercentage, formatDate } from '@/lib/utils'

async function getCampaigns() {
  const campaigns = await db.emailCampaign.findMany({
    orderBy: { sentAt: 'desc' },
    include: {
      recipients: true,
      groups: {
        include: {
          group: true
        }
      }
    }
  })

  return campaigns.map(campaign => {
    const delivered = campaign.recipients.filter(r => r.delivered).length
    const opened = campaign.recipients.filter(r => r.opened).length
    const clicked = campaign.recipients.filter(r => r.clicked).length

    return {
      id: campaign.id,
      subject: campaign.subject,
      sentAt: campaign.sentAt,
      sentBy: campaign.sentBy,
      totalRecipients: campaign.totalRecipients,
      delivered,
      opened,
      clicked,
      openRate: calculatePercentage(opened, delivered),
      clickRate: calculatePercentage(clicked, delivered),
      groups: campaign.groups.map(g => g.group.name)
    }
  })
}

export default async function EmailHistoryPage() {
  const campaigns = await getCampaigns()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-crimson font-bold text-gray-900">Email History</h1>
          <p className="mt-2 text-sm text-gray-700">
            View all sent email campaigns and their performance
          </p>
        </div>
        <Link href="/admin/emails/compose">
          <Button>Compose New Email</Button>
        </Link>
      </div>

      {/* Campaigns List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {campaigns.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500 mb-4">No emails sent yet</p>
            <Link href="/admin/emails/compose">
              <Button>Send Your First Email</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipients
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivered
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Open Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Click Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Groups
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {campaign.subject}
                      </div>
                      <div className="text-xs text-gray-500">
                        by {campaign.sentBy}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(campaign.sentAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {campaign.totalRecipients}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {campaign.delivered}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {campaign.openRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {campaign.clickRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {campaign.groups.map(group => (
                          <span
                            key={group}
                            className="inline-flex items-center rounded-full bg-brand-sage/20 px-2 py-0.5 text-xs font-medium text-brand-forest"
                          >
                            {group}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
