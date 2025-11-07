/**
 * Centralized bike fit calculation engine (v1)
 *
 * This module provides a single source of truth for computing bike fit recommendations
 * based on rider anthropometrics, frame geometry, and current setup.
 *
 * All measurements use millimeters (mm) and degrees (°) internally.
 */

import { cmToMm } from './units'

// ============================================================================
// Types
// ============================================================================

export type Flexibility = 'low' | 'medium' | 'high'
export type RidingStyle = 'comfort' | 'endurance' | 'race'

/**
 * Rider anthropometric and preference data
 */
export interface RiderProfile {
  height_cm?: number
  inseam_cm?: number
  torso_length_cm: number
  arm_length_cm: number
  flexibility: Flexibility
  riding_style: RidingStyle
}

/**
 * Frame geometry specifications
 */
export interface FrameGeometry {
  stack_mm: number
  reach_mm: number
  head_tube_angle_deg?: number
  seat_tube_angle_deg?: number
  wheelbase_mm?: number
}

/**
 * Current bike setup measurements
 */
export interface CurrentSetup {
  stem_length_mm: number
  spacer_stack_mm: number
  bar_reach_mm: number
  hood_reach_offset_mm?: number
  saddle_height_mm?: number
  saddle_setback_mm?: number
}

/**
 * Computed fit recommendation with ranges and confidence
 */
export interface FitRecommendation {
  targetReach: {
    min_mm: number
    mid_mm: number
    max_mm: number
  }
  targetDrop: {
    min_mm: number
    max_mm: number
  }
  stem: {
    snapped_mm: number
    allowed_mm: number[]
    basis_mm: number
  }
  spacers: {
    recommended_mm: number
    min_mm: number | null
    max_mm: number | null
  }
  confidence: number
  notes: string[]
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Standard stem lengths available in the market (mm)
 */
const STEM_SIZES_MM = [50, 60, 70, 80, 90, 100, 110, 120]

/**
 * Reach adjustments based on flexibility (mm)
 */
const FLEXIBILITY_ADJUSTMENTS: Record<Flexibility, number> = {
  low: -15,
  medium: 0,
  high: 10,
}

/**
 * Reach adjustments based on riding style (mm)
 */
const RIDING_STYLE_ADJUSTMENTS: Record<RidingStyle, number> = {
  comfort: -20,
  endurance: 0,
  race: 15,
}

/**
 * Target drop ranges based on riding style (mm)
 */
const DROP_RANGES: Record<RidingStyle, { min_mm: number; max_mm: number }> = {
  comfort: { min_mm: 10, max_mm: 20 },
  endurance: { min_mm: 20, max_mm: 40 },
  race: { min_mm: 50, max_mm: 80 },
}

/**
 * Default hood reach offset if not specified (mm)
 */
const DEFAULT_HOOD_REACH_OFFSET_MM = 10

/**
 * Target reach tolerance range (±mm)
 */
const REACH_TOLERANCE_MM = 5

// ============================================================================
// Core Computation
// ============================================================================

/**
 * Compute bike fit recommendation based on rider, frame, and current setup
 *
 * @param rider - Rider anthropometric data and preferences
 * @param frame - Frame geometry specifications
 * @param current - Current bike setup measurements
 * @returns Comprehensive fit recommendation with confidence score
 *
 * @example
 * ```ts
 * const recommendation = computeFitRecommendation(
 *   { torso_length_cm: 60, arm_length_cm: 65, flexibility: 'medium', riding_style: 'endurance' },
 *   { stack_mm: 590, reach_mm: 386 },
 *   { stem_length_mm: 90, spacer_stack_mm: 20, bar_reach_mm: 80 }
 * )
 * ```
 */
export function computeFitRecommendation(
  rider: RiderProfile,
  frame: FrameGeometry,
  current: CurrentSetup
): FitRecommendation {
  const notes: string[] = []

  // Calculate base target reach from anthropometrics
  const baseReach = calculateBaseReach(rider)

  // Apply adjustments for flexibility and riding style
  const adjustments =
    FLEXIBILITY_ADJUSTMENTS[rider.flexibility] +
    RIDING_STYLE_ADJUSTMENTS[rider.riding_style]

  const targetReachMid = baseReach + adjustments
  const targetReachMin = targetReachMid - REACH_TOLERANCE_MM
  const targetReachMax = targetReachMid + REACH_TOLERANCE_MM

  // Get target drop range
  const targetDrop = DROP_RANGES[rider.riding_style]

  // Calculate needed stem length
  const hoodReachOffset = current.hood_reach_offset_mm ?? DEFAULT_HOOD_REACH_OFFSET_MM
  const basisStem = targetReachMid - (frame.reach_mm + current.bar_reach_mm + hoodReachOffset)
  const snappedStem = snapStemLength(basisStem)
  const allowedStems = getAllowedStems(snappedStem)

  // Calculate spacer recommendations
  const spacers = calculateSpacerRecommendation(
    frame,
    current,
    targetDrop,
    notes
  )

  // Calculate confidence based on input completeness
  const confidence = calculateConfidence(rider, frame, current, notes)

  return {
    targetReach: {
      min_mm: Math.round(targetReachMin),
      mid_mm: Math.round(targetReachMid),
      max_mm: Math.round(targetReachMax),
    },
    targetDrop,
    stem: {
      snapped_mm: snappedStem,
      allowed_mm: allowedStems,
      basis_mm: Math.round(basisStem),
    },
    spacers,
    confidence,
    notes,
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate base target reach from rider anthropometrics
 * Formula: torso_length_cm * 0.43 * 10 + arm_length_cm * 0.35 * 10
 *
 * @param rider - Rider profile
 * @returns Base reach in mm (before adjustments)
 */
function calculateBaseReach(rider: RiderProfile): number {
  return cmToMm(rider.torso_length_cm) * 0.43 + cmToMm(rider.arm_length_cm) * 0.35
}

/**
 * Snap stem length to nearest standard size
 * Ties round up to the longer stem
 *
 * @param basisMm - Calculated ideal stem length
 * @returns Nearest standard stem size in mm
 */
function snapStemLength(basisMm: number): number {
  let nearest = STEM_SIZES_MM[0]
  let minDiff = Math.abs(basisMm - nearest)

  for (const size of STEM_SIZES_MM) {
    const diff = Math.abs(basisMm - size)
    // If exactly equal distance, prefer the longer stem (tie goes up)
    if (diff < minDiff || (diff === minDiff && size > nearest)) {
      nearest = size
      minDiff = diff
    }
  }

  return nearest
}

/**
 * Get allowed stem sizes within ±10mm of snapped size
 *
 * @param snappedMm - Snapped stem length
 * @returns Array of allowed stem sizes
 */
function getAllowedStems(snappedMm: number): number[] {
  const minAllowed = snappedMm - 10
  const maxAllowed = snappedMm + 10

  return STEM_SIZES_MM.filter(
    size => size >= minAllowed && size <= maxAllowed
  )
}

/**
 * Calculate spacer stack recommendation
 *
 * Returns null range if insufficient data to compute precisely,
 * but always provides a pragmatic recommendation (defaults to current spacers)
 *
 * @param frame - Frame geometry
 * @param current - Current setup
 * @param targetDrop - Target drop range
 * @param notes - Array to append warning notes
 * @returns Spacer recommendation with optional range
 */
function calculateSpacerRecommendation(
  frame: FrameGeometry,
  current: CurrentSetup,
  targetDrop: { min_mm: number; max_mm: number },
  notes: string[]
): { recommended_mm: number; min_mm: number | null; max_mm: number | null } {
  // We need frame stack and current spacers at minimum
  if (!frame.stack_mm || current.spacer_stack_mm === undefined) {
    notes.push('Insufficient data for precise spacer calculation; using current setup')
    return {
      recommended_mm: current.spacer_stack_mm ?? 20,
      min_mm: null,
      max_mm: null,
    }
  }

  // Simplified calculation: adjust spacers to achieve target drop
  // This is a pragmatic proxy without full saddle height modeling

  // Current handlebar height (approx) = stack + spacers
  const currentHandlebarHeight = frame.stack_mm + current.spacer_stack_mm

  // For target drop range, we compute spacer adjustments
  // Drop = saddle height - handlebar height
  // If we want more drop, we need lower handlebars (fewer spacers)
  // If we want less drop, we need higher handlebars (more spacers)

  // Since we don't have saddle height, we work with deltas from current
  // Assume current drop is within acceptable range and make minor adjustments

  // Calculate spacer range to achieve target drop (rough proxy)
  // For now, suggest keeping current spacers but provide a reasonable range
  const spacerMin = Math.max(0, current.spacer_stack_mm - 20)
  const spacerMax = current.spacer_stack_mm + 20

  // Clamp recommended to stay within range
  const recommended = Math.max(spacerMin, Math.min(spacerMax, current.spacer_stack_mm))

  return {
    recommended_mm: recommended,
    min_mm: spacerMin,
    max_mm: spacerMax,
  }
}

/**
 * Calculate confidence score based on input completeness
 *
 * Required fields for full confidence:
 * - torso_length_cm, arm_length_cm (rider)
 * - stack_mm, reach_mm (frame)
 * - bar_reach_mm, stem_length_mm (current)
 *
 * Start at 1.0, subtract 0.15 for each missing required field (min 0.3)
 *
 * @param rider - Rider profile
 * @param frame - Frame geometry
 * @param current - Current setup
 * @param notes - Array to append warning notes
 * @returns Confidence score between 0.3 and 1.0
 */
function calculateConfidence(
  rider: RiderProfile,
  frame: FrameGeometry,
  current: CurrentSetup,
  notes: string[]
): number {
  let confidence = 1.0
  const requiredFields: Array<{ value: any; name: string }> = [
    { value: rider.torso_length_cm, name: 'torso length' },
    { value: rider.arm_length_cm, name: 'arm length' },
    { value: frame.stack_mm, name: 'frame stack' },
    { value: frame.reach_mm, name: 'frame reach' },
    { value: current.bar_reach_mm, name: 'bar reach' },
    { value: current.stem_length_mm, name: 'stem length' },
  ]

  for (const field of requiredFields) {
    if (field.value === undefined || field.value === null || field.value === 0) {
      confidence -= 0.15
      notes.push(`Missing ${field.name} reduces confidence`)
    }
  }

  return Math.max(0.3, confidence)
}
