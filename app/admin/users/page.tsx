/**
 * Users List Page
 * View and manage all users
 */

import { db } from '@/lib/db'
import UsersTable from '@/components/admin/users-table'

async function getUsers() {
  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      groups: {
        include: {
          group: true
        }
      }
    }
  })

  return users.map(user => ({
    id: user.id,
    email: user.email,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    createdAt: user.createdAt,
    videoAccessed: user.videoAccessed,
    groups: user.groups.map(ug => ug.group.name)
  }))
}

export default async function UsersPage() {
  const users = await getUsers()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-crimson font-bold text-gray-900">Users</h1>
        <p className="mt-2 text-sm text-gray-700">
          Manage all users who have signed up
        </p>
      </div>

      <UsersTable users={users} />
    </div>
  )
}
