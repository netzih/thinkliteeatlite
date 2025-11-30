/**
 * NextAuth Configuration
 * Handles both admin and user authentication
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
        password: { label: 'Password', type: 'password' },
        userType: { label: 'User Type', type: 'text' } // 'admin' or 'user'
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required')
        }

        const userType = credentials.userType || 'user'

        if (userType === 'admin') {
          // Admin authentication
          const admin = await db.admin.findUnique({
            where: { email: credentials.email }
          })

          if (!admin) {
            throw new Error('Invalid credentials')
          }

          const passwordMatch = await bcrypt.compare(
            credentials.password,
            admin.password
          )

          if (!passwordMatch) {
            throw new Error('Invalid credentials')
          }

          return {
            id: admin.id,
            email: admin.email,
            name: admin.name || null,
            role: 'admin'
          }
        } else {
          // User authentication
          const user = await db.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user || !user.password) {
            throw new Error('Invalid credentials')
          }

          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!passwordMatch) {
            throw new Error('Invalid credentials')
          }

          return {
            id: user.id,
            email: user.email,
            name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : null,
            role: 'user'
          }
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as any).role = token.role
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}
