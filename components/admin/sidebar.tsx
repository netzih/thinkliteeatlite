/**
 * Admin Sidebar Navigation
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, Mail, BarChart3, Settings, Workflow } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Compose Email', href: '/admin/emails/compose', icon: Mail },
  { name: 'Email History', href: '/admin/emails', icon: BarChart3 },
  { name: 'Email Flows', href: '/admin/flows', icon: Workflow },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-brand-forest px-6 pb-4">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center">
          <h1 className="font-crimson text-2xl font-bold text-white">
            Think Lite Eat Lite
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          isActive
                            ? 'bg-brand-teal text-white'
                            : 'text-brand-sage hover:text-white hover:bg-brand-teal',
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                        )}
                      >
                        <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}
