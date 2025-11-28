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
import { replaceMergeTags, getUserMergeTagData } from '@/lib/merge-tags'

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
    const errors: string[] = []

    const sendPromises = uniqueUsers.map(async (user) => {
      const trackingId = generateTrackingId()

      try {
        // Create tracking record
        await db.emailRecipient.create({
          data: {
            userId: user.id,
            campaignId: campaign.id,
            trackingId,
          }
        })

        // Get user merge tag data
        const mergeData = getUserMergeTagData(
          user,
          process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        )

        // Replace merge tags in subject and content
        const personalizedSubject = replaceMergeTags(subject, mergeData)
        const personalizedHtml = replaceMergeTags(htmlContent, mergeData)
        const personalizedText = replaceMergeTags(stripHtml(htmlContent), mergeData)

        // Send email with personalized content
        const result = await sendEmail({
          to: user.email,
          subject: personalizedSubject,
          html: personalizedHtml,
          text: personalizedText
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
        } else {
          errors.push(`Failed to send to ${user.email}: ${JSON.stringify(result.error)}`)
        }

        return result
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        errors.push(`Error sending to ${user.email}: ${errorMsg}`)
        console.error(`Error sending to ${user.email}:`, error)
        return { success: false, error }
      }
    })

    // Wait for all emails to send
    await Promise.all(sendPromises)

    // Log any errors
    if (errors.length > 0) {
      console.error('Email sending errors:', errors)
    }

    // Update campaign stats
    await db.emailCampaign.update({
      where: { id: campaign.id },
      data: { delivered }
    })

    return NextResponse.json({
      success: true,
      campaignId: campaign.id,
      recipientCount: uniqueUsers.length,
      delivered,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
