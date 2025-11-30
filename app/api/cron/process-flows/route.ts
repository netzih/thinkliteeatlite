/**
 * Flow Processing Cron Job
 * Processes pending automated email flows
 * Should be called every hour (or as often as you want to check)
 */

import { NextRequest, NextResponse } from 'next/server'
import { processPendingFlows } from '@/lib/flows'

export async function GET(request: NextRequest) {
  try {
    // Optional: Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Process pending flows
    const result = await processPendingFlows()

    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Allow POST as well (some cron services use POST)
export async function POST(request: NextRequest) {
  return GET(request)
}
