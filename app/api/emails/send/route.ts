/**
 * Send Email API
 * Sends campaign emails to selected groups
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { sendEmail, stripHtml } from '@/lib/email'
import { generateTrackingId } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request
    const { subject, htmlContent, groupIds } = await request.json()

    // Validation
    if (!subject || !htmlContent || !groupIds || groupIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get all users in selected groups
    const userGroups = await db.userGroup.findMany({
      where: { groupId: { in: groupIds } },
      include: { user: true }
    })

    // Deduplicate users (in case they're in multiple groups)
    const uniqueUsers = Array.from(
      new Map(userGroups.map(ug => [ug.user.id, ug.user])).values()
    )

    if (uniqueUsers.length === 0) {
      return NextResponse.json(
        { error: 'No users found in selected groups' },
        { status: 400 }
      )
    }

    // Create email campaign
    const campaign = await db.emailCampaign.create({
      data: {
        subject,
        htmlContent,
        textContent: stripHtml(htmlContent),
        sentBy: session.user?.email || 'admin',
        totalRecipients: uniqueUsers.length,
      }
    })

    // Link campaign to groups
    await db.emailToGroup.createMany({
      data: groupIds.map((groupId: string) => ({
        campaignId: campaign.id,
        groupId
      }))
    })

    // Send emails and create tracking records
    let delivered = 0
    const sendPromises = uniqueUsers.map(async (user) => {
      const trackingId = generateTrackingId()

      // Create tracking record
      await db.emailRecipient.create({
        data: {
          userId: user.id,
          campaignId: campaign.id,
          trackingId,
        }
      })

      // Send email
      const result = await sendEmail({
        to: user.email,
        subject,
        html: htmlContent,
        text: stripHtml(htmlContent)
      })

      if (result.success) {
        // Mark as delivered
        await db.emailRecipient.updateMany({
          where: { trackingId },
          data: {
            delivered: true,
            deliveredAt: new Date()
          }
        })
        delivered++
      }

      return result
    })

    // Wait for all emails to send
    await Promise.all(sendPromises)

    // Update campaign stats
    await db.emailCampaign.update({
      where: { id: campaign.id },
      data: { delivered }
    })

    return NextResponse.json({
      success: true,
      campaignId: campaign.id,
      recipientCount: uniqueUsers.length,
      delivered
    })

  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
