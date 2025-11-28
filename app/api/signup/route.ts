/**
 * Signup API Route
 * Handles user registration and sends welcome email
 *
 * How it works:
 * 1. Validates email and name
 * 2. Checks if user already exists
 * 3. Creates user in database with unique access token
 * 4. Adds user to "All Users" group
 * 5. Sends welcome email with video link
 * 6. Returns success response
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateAccessToken, isValidEmail } from '@/lib/utils'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { email, firstName, lastName } = body

    // Validate required fields
    if (!email || !firstName) {
      return NextResponse.json(
        { error: 'Email and first name are required' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      // User already signed up - resend welcome email
      await sendWelcomeEmail(
        existingUser.email,
        existingUser.firstName || '',
        existingUser.accessToken
      )

      return NextResponse.json({
        success: true,
        message: 'Welcome back! Check your email for your access link.',
        alreadyExists: true
      })
    }

    // Generate unique access token for video
    const accessToken = generateAccessToken()

    // Create user in database
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        firstName: firstName.trim(),
        lastName: lastName?.trim() || null,
        accessToken,
      }
    })

    // Get or create "All Users" group
    let allUsersGroup = await db.group.findUnique({
      where: { name: 'All Users' }
    })

    if (!allUsersGroup) {
      allUsersGroup = await db.group.create({
        data: {
          name: 'All Users',
          description: 'All users who have signed up'
        }
      })
    }

    // Add user to "All Users" group
    await db.userGroup.create({
      data: {
        userId: user.id,
        groupId: allUsersGroup.id
      }
    })

    // Send welcome email with video access link
    const emailResult = await sendWelcomeEmail(
      user.email,
      user.firstName || '',
      user.accessToken
    )

    if (!emailResult.success) {
      console.error('Failed to send welcome email:', emailResult.error)
      // Don't fail the signup if email fails - user is still created
    }

    // Return success
    return NextResponse.json({
      success: true,
      message: 'Success! Check your email for your free course.',
      user: {
        email: user.email,
        firstName: user.firstName
      }
    })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
