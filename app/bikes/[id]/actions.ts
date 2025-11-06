'use server'

import { auth } from '@/auth'
import { updateBike } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { ROUTES } from '@/lib/constants'

export async function updateBikeCockpit(
  bikeId: string,
  data: {
    stem_mm: number
    spacer_mm: number
    bar_reach_category: 'short' | 'med' | 'long'
  }
) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  await updateBike(bikeId, session.user.id, data)

  // Revalidate the bike page to show updated data
  revalidatePath(ROUTES.bike(bikeId))

  return { success: true }
}
