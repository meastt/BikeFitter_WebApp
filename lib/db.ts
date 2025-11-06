/**
 * Database helper functions
 * Uses Supabase with NextAuth for authentication
 */

import { createClient } from '@/lib/supabase/server'

// ===================
// USER PROFILE
// ===================

export async function getUserProfile(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error && error.code === 'PGRST116') {
    // User doesn't exist yet - return null
    return null
  }

  if (error) throw error
  return data
}

export async function upsertUserProfile(userId: string, email: string, profile?: Partial<{
  height_cm: number
  inseam_cm: number
  torso_cm: number
  arm_cm: number
  flexibility_level: number
  riding_style: string
  pain_points: string[]
}>) {
  const supabase = await createClient()

  // Filter out undefined values - Supabase doesn't accept them
  const filteredProfile = profile
    ? Object.fromEntries(
        Object.entries(profile).filter(([_, value]) => value !== undefined)
      )
    : {}

  const payload = {
    id: userId,
    email,
    ...filteredProfile,
    updated_at: new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('users')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single()

  if (error) throw error
  return data
}

// ===================
// FRAMES
// ===================

export async function listFrames(search?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('frames')
    .select('*')
    .order('brand', { ascending: true })
    .order('model', { ascending: true })

  if (search && search.trim()) {
    // Search across brand and model
    query = query.or(`brand.ilike.%${search}%,model.ilike.%${search}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getFrame(frameId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('frames')
    .select('*')
    .eq('id', frameId)
    .single()

  if (error) throw error
  return data
}

// ===================
// BIKES
// ===================

export async function getBikes(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('bikes')
    .select(`
      *,
      frames (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getBike(bikeId: string, userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('bikes')
    .select(`
      *,
      frames (*),
      fits (*)
    `)
    .eq('id', bikeId)
    .eq('user_id', userId)
    .single()

  if (error && error.code === 'PGRST116') {
    // Bike not found or user doesn't own it - return null
    return null
  }

  if (error) throw error
  return data
}

export async function createBike(
  userId: string,
  payload: {
    name?: string
    frame_id?: string
    stem_mm?: number
    spacer_mm?: number
    bar_reach_category?: 'short' | 'med' | 'long'
    saddle_height_mm?: number
    saddle_setback_mm?: number
  }
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('bikes')
    .insert({
      user_id: userId,
      ...payload,
    })
    .select(`
      *,
      frames (*)
    `)
    .single()

  if (error) throw error
  return data
}

export async function updateBike(
  bikeId: string,
  userId: string,
  payload: Partial<{
    name: string
    frame_id: string
    stem_mm: number
    spacer_mm: number
    bar_reach_category: 'short' | 'med' | 'long'
    saddle_height_mm: number
    saddle_setback_mm: number
  }>
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('bikes')
    .update({
      ...payload,
      updated_at: new Date().toISOString()
    })
    .eq('id', bikeId)
    .eq('user_id', userId) // Ensure user owns this bike
    .select(`
      *,
      frames (*)
    `)
    .single()

  if (error) throw error
  return data
}

export async function deleteBike(bikeId: string, userId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('bikes')
    .delete()
    .eq('id', bikeId)
    .eq('user_id', userId) // Ensure user owns this bike

  if (error) throw error
}

// ===================
// FITS
// ===================
// Note: Fit recommendation functions will be implemented in Phase 3
