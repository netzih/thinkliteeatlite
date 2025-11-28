/**
 * Email Composer Page
 * Compose and send emails with Jodit editor
 */

import { db } from '@/lib/db'
import EmailComposer from '@/components/admin/email-composer'

async function getGroups() {
  return db.group.findMany({
    include: {
      users: true
    },
    orderBy: { name: 'asc' }
  })
}

export default async function ComposeEmailPage() {
  const groups = await getGroups()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-crimson font-bold text-gray-900">Compose Email</h1>
        <p className="mt-2 text-sm text-gray-700">
          Create and send emails to your users
        </p>
      </div>

      <EmailComposer
        groups={groups.map(g => ({
          id: g.id,
          name: g.name,
          userCount: g.users.length
        }))}
      />
    </div>
  )
}
