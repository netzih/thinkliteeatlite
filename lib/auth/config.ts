/**
 * NextAuth Configuration
 * Handles admin authentication
 */

import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required')
        }

        // Find admin user
        const admin = await db.admin.findUnique({
          where: { email: credentials.email }
        })

        if (!admin) {
          throw new Error('Invalid credentials')
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(
          credentials.password,
          admin.password
        )

        if (!passwordMatch) {
          throw new Error('Invalid credentials')
        }

        // Return user data
        return {
          id: admin.id,
          email: admin.email,
          name: admin.name
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}
