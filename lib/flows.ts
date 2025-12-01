/**
 * Email Flow Utilities
 * Handle triggering and scheduling automated email flows
 */

import { db } from '@/lib/db'

/**
 * Trigger a flow for a user
 * Creates scheduled executions for all steps in the flow
 */
export async function triggerFlow(userId: string, trigger: string) {
  try {
    // Find all enabled flows for this trigger
    const flows = await db.emailFlow.findMany({
      where: {
        trigger,
        enabled: true
      },
      include: {
        steps: {
          where: { enabled: true },
          orderBy: { stepNumber: 'asc' }
        }
      }
    })

    // For each flow, schedule all steps
    for (const flow of flows) {
      for (const step of flow.steps) {
        // Calculate scheduled date
        const scheduledFor = new Date()
        scheduledFor.setDate(scheduledFor.getDate() + step.delayDays)

        // Create execution record
        await db.emailFlowExecution.create({
          data: {
            userId,
            flowId: flow.id,
            stepId: step.id,
            scheduledFor,
            status: 'pending'
          }
        })
      }
    }

    console.log(`Triggered ${flows.length} flow(s) for user ${userId} on trigger: ${trigger}`)
  } catch (error) {
    console.error('Error triggering flow:', error)
    throw error
  }
}

/**
 * Process pending flow emails
 * Should be called by a cron job or scheduled task
 */
export async function processPendingFlows() {
  try {
    const now = new Date()

    // Find all pending executions that are due
    const pendingExecutions = await db.emailFlowExecution.findMany({
      where: {
        status: 'pending',
        scheduledFor: {
          lte: now
        }
      },
      include: {
        step: true,
        flow: true
      }
    })

    console.log(`Processing ${pendingExecutions.length} pending flow email(s)`)

    const { sendEmail } = await import('@/lib/email')
    const { replaceMergeTags, getUserMergeTagData } = await import('@/lib/merge-tags')
    const { wrapEmailContent } = await import('@/lib/email-template')

    // Process each execution
    for (const execution of pendingExecutions) {
      try {
        // Get user
        const user = await db.user.findUnique({
          where: { id: execution.userId }
        })

        if (!user) {
          // Mark as failed if user not found
          await db.emailFlowExecution.update({
            where: { id: execution.id },
            data: {
              status: 'failed',
              error: 'User not found'
            }
          })
          continue
        }

        // Get merge tag data
        const mergeData = getUserMergeTagData(
          user,
          process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        )

        // Replace merge tags in content
        const personalizedContent = replaceMergeTags(execution.step.htmlContent, mergeData)

        // Wrap content with header/footer template
        const wrappedHtml = await wrapEmailContent(personalizedContent)

        // Replace merge tags in subject and final HTML
        const personalizedSubject = replaceMergeTags(execution.step.subject, mergeData)
        const personalizedHtml = replaceMergeTags(wrappedHtml, mergeData)
        const personalizedText = replaceMergeTags(execution.step.textContent, mergeData)

        // Send email
        const result = await sendEmail({
          to: user.email,
          subject: personalizedSubject,
          html: personalizedHtml,
          text: personalizedText
        })

        if (result.success) {
          // Mark as sent
          await db.emailFlowExecution.update({
            where: { id: execution.id },
            data: {
              status: 'sent',
              sentAt: new Date()
            }
          })
          console.log(`✓ Sent flow email to ${user.email}: ${execution.step.subject}`)
        } else {
          // Mark as failed
          await db.emailFlowExecution.update({
            where: { id: execution.id },
            data: {
              status: 'failed',
              error: JSON.stringify(result.error)
            }
          })
          console.error(`✗ Failed to send flow email to ${user.email}:`, result.error)
        }
      } catch (error) {
        // Mark as failed
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        await db.emailFlowExecution.update({
          where: { id: execution.id },
          data: {
            status: 'failed',
            error: errorMsg
          }
        })
        console.error(`Error processing execution ${execution.id}:`, error)
      }
    }

    return {
      processed: pendingExecutions.length,
      timestamp: new Date()
    }
  } catch (error) {
    console.error('Error processing pending flows:', error)
    throw error
  }
}

/**
 * Cancel all pending flow emails for a user
 * Useful for unsubscribe functionality
 */
export async function cancelUserFlows(userId: string) {
  try {
    const result = await db.emailFlowExecution.updateMany({
      where: {
        userId,
        status: 'pending'
      },
      data: {
        status: 'skipped',
        error: 'Cancelled by user'
      }
    })

    console.log(`Cancelled ${result.count} pending flow email(s) for user ${userId}`)
    return result.count
  } catch (error) {
    console.error('Error cancelling user flows:', error)
    throw error
  }
}
