/**
 * Merge Tag Utilities
 * Handle email personalization variables
 */

interface MergeTagData {
  firstName?: string
  lastName?: string
  email: string
  videoLink?: string
  unsubscribeLink?: string
  [key: string]: string | undefined
}

/**
 * Available merge tags and their descriptions
 */
export const AVAILABLE_MERGE_TAGS = [
  { tag: '{{firstName}}', description: "User's first name", example: 'Sarah' },
  { tag: '{{lastName}}', description: "User's last name", example: 'Johnson' },
  { tag: '{{email}}', description: "User's email address", example: 'sarah@example.com' },
  { tag: '{{fullName}}', description: "User's full name", example: 'Sarah Johnson' },
  { tag: '{{videoLink}}', description: "Personal video access link", example: 'https://...' },
  { tag: '{{unsubscribeLink}}', description: "Unsubscribe link", example: 'https://...' },
] as const

/**
 * Replace merge tags in content with actual user data
 */
export function replaceMergeTags(content: string, data: MergeTagData): string {
  let processed = content

  // Replace each tag with actual data
  const replacements: Record<string, string> = {
    '{{firstName}}': data.firstName || '',
    '{{lastName}}': data.lastName || '',
    '{{email}}': data.email,
    '{{fullName}}': `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email,
    '{{videoLink}}': data.videoLink || '#',
    '{{unsubscribeLink}}': data.unsubscribeLink || '#',
  }

  // Replace all occurrences
  Object.entries(replacements).forEach(([tag, value]) => {
    processed = processed.replace(new RegExp(tag.replace(/[{}]/g, '\\$&'), 'g'), value)
  })

  return processed
}

/**
 * Get merge tag data for a user
 */
export function getUserMergeTagData(user: {
  email: string
  firstName?: string | null
  lastName?: string | null
  accessToken?: string
}, appUrl: string): MergeTagData {
  return {
    firstName: user.firstName || undefined,
    lastName: user.lastName || undefined,
    email: user.email,
    fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined,
    videoLink: user.accessToken ? `${appUrl}/watch?token=${user.accessToken}` : undefined,
    unsubscribeLink: user.accessToken ? `${appUrl}/unsubscribe?token=${user.accessToken}` : undefined,
  }
}

/**
 * Validate if content contains valid merge tags
 */
export function validateMergeTags(content: string): { valid: boolean; invalidTags: string[] } {
  const tagRegex = /\{\{([^}]+)\}\}/g
  const matches = Array.from(content.matchAll(tagRegex))
  const validTags = AVAILABLE_MERGE_TAGS.map(t => t.tag)
  const invalidTags: string[] = []

  for (const match of matches) {
    const fullTag = match[0]
    if (!validTags.includes(fullTag)) {
      invalidTags.push(fullTag)
    }
  }

  return {
    valid: invalidTags.length === 0,
    invalidTags
  }
}
