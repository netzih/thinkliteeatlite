/**
 * Admin Courses API
 * POST: Create a new course
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, slug, description, price, published } = await request.json()

    // Validate required fields
    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      )
    }

    // Check if slug is already taken
    const existingCourse = await db.course.findUnique({
      where: { slug }
    })

    if (existingCourse) {
      return NextResponse.json(
        { error: 'A course with this slug already exists' },
        { status: 400 }
      )
    }

    // Get the highest order number to append new course at the end
    const lastCourse = await db.course.findFirst({
      orderBy: { order: 'desc' }
    })
    const nextOrder = (lastCourse?.order || 0) + 1

    // Create the course
    const course = await db.course.create({
      data: {
        title,
        slug,
        description: description || '',
        price: price || 0,
        published: published || false,
        order: nextOrder
      }
    })

    return NextResponse.json(
      { success: true, course },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    )
  }
}
