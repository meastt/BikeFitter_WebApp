'use server'

import { auth } from '@/auth'
import { updateBike } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { ROUTES } from '@/lib/constants'
import { bikeUpdateSchema, safeValidate } from '@/lib/validations'

type ActionResult =
  | { success: true }
  | { success: false; error: string }

export async function updateBikeCockpit(
  bikeId: string,
  data: {
    stem_mm: number
    spacer_mm: number
    bar_reach_category: 'short' | 'med' | 'long'
  }
): Promise<ActionResult> {
  // 1. Check authentication
  const session = await auth()

  if (!session?.user?.id) {
    return {
      success: false,
      error: 'You must be signed in to update bikes. Please sign in and try again.',
    }
  }

  // 2. Validate input data
  const validation = safeValidate(bikeUpdateSchema, data)

  if (!validation.success) {
    return {
      success: false,
      error: `Invalid input: ${validation.error}`,
    }
  }

  // 3. Update bike in database
  try {
    await updateBike(bikeId, session.user.id, validation.data)

    // 4. Revalidate the bike page to show updated data
    revalidatePath(ROUTES.bike(bikeId))

    return { success: true }
  } catch (error) {
    console.error('Failed to update bike:', error)

    // Check if this is a not-found error (user doesn't own bike)
    if (error instanceof Error && error.message.includes('No rows')) {
      return {
        success: false,
        error: 'Bike not found or you do not have permission to update it.',
      }
    }

    return {
      success: false,
      error: 'Failed to save changes. Please try again.',
    }
  }
}
