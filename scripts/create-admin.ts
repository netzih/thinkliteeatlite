/**
 * Script to create an admin user
 * Run with: npx tsx scripts/create-admin.ts
 */

import { db } from '../lib/db'
import { hashPassword } from '../lib/auth/utils'

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@thinkliteeatlite.com'
  const password = process.env.ADMIN_PASSWORD || 'changeme123'
  const name = 'Admin'

  console.log('Creating admin user...')
  console.log('Email:', email)

  // Check if admin already exists
  const existing = await db.admin.findUnique({
    where: { email }
  })

  if (existing) {
    console.log('❌ Admin user already exists with this email')
    process.exit(1)
  }

  // Hash password
  const hashedPassword = await hashPassword(password)

  // Create admin
  const admin = await db.admin.create({
    data: {
      email,
      name,
      password: hashedPassword
    }
  })

  console.log('✅ Admin user created successfully!')
  console.log('---')
  console.log('Login at: /admin/login')
  console.log('Email:', email)
  console.log('Password:', password)
  console.log('---')
  console.log('⚠️  IMPORTANT: Change the password after first login!')

  process.exit(0)
}

createAdmin().catch((error) => {
  console.error('Error creating admin:', error)
  process.exit(1)
})
