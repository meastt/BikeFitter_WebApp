/**
 * Adapter layer between the new v1 fit engine and existing UI
 *
 * This module bridges the gap between:
 * - Old fit-calculator.ts (with pain points, bar categories, flexibility levels 1-3)
 * - New fit.ts (pure anthropometric calculations with flexibility strings)
 *
 * The adapter converts between formats and augments v1 results with
 * legacy fields needed by the UI (flags, rationale, etc.)
 */

import {
  computeFitRecommendation,
  type RiderProfile,
  type FrameGeometry,
  type CurrentSetup,
  type FitRecommendation,
  type Flexibility,
  type RidingStyle,
} from './fit'
import type { FitInput, FitResult, BarCategory } from './fit-calculator'

/**
 * Bar reach mapping from categories to millimeters
 */
const BAR_REACH_MM: Record<BarCategory, number> = {
  short: 72,
  med: 78,
  long: 86,
}

/**
 * Standard stem sizes for snapping
 */
const STEM_SIZES = [50, 60, 70, 80, 90, 100, 110, 120]

/**
 * Convert old fit-calculator input to new v1 fit engine format
 * and compute recommendations using the centralized fit logic
 *
 * @param input - Legacy fit input format
 * @returns Legacy fit result format (for UI compatibility)
 */
export function calculateFitV1(input: FitInput): FitResult {
  // Convert flexibility level to new format
  const flexibility: Flexibility =
    input.flexibility_level === 1 ? 'low' :
    input.flexibility_level === 3 ? 'high' :
    'medium'

  // Build rider profile for v1 engine
  const rider: RiderProfile = {
    torso_length_cm: input.torso_cm,
    arm_length_cm: input.arm_cm,
    flexibility,
    riding_style: input.riding_style,
  }

  // Build frame geometry for v1 engine
  const frame: FrameGeometry = {
    stack_mm: 0, // Not used in reach calculation
    reach_mm: input.frame_reach_mm,
  }

  // Convert bar category to actual mm value
  const barReachMm = BAR_REACH_MM[input.bar_reach_category]

  // Build current setup for v1 engine
  const current: CurrentSetup = {
    stem_length_mm: input.stem_mm,
    spacer_stack_mm: input.spacer_mm,
    bar_reach_mm: barReachMm,
    hood_reach_offset_mm: 10, // Standard offset
  }

  // Call the centralized v1 fit engine
  const v1Result = computeFitRecommendation(rider, frame, current)

  // Calculate current effective reach (for UI display)
  const currentEffectiveReach = input.frame_reach_mm + input.stem_mm + barReachMm + 10

  // Determine recommended bar category based on stem
  let recommendedBar: BarCategory = input.bar_reach_category
  if (v1Result.stem.snapped_mm < 50 && input.bar_reach_category !== 'short') {
    recommendedBar = 'short'
  } else if (v1Result.stem.snapped_mm > 110 && input.bar_reach_category !== 'long') {
    recommendedBar = 'long'
  }

  // Generate flags based on v1 results
  const flags: string[] = []
  if (v1Result.stem.snapped_mm <= 50 && currentEffectiveReach > v1Result.targetReach.mid_mm) {
    flags.push('frame_maybe_too_long')
  }
  if (v1Result.stem.snapped_mm >= 110 && currentEffectiveReach < v1Result.targetReach.mid_mm) {
    flags.push('frame_maybe_too_short')
  }
  if (v1Result.stem.snapped_mm <= 50 || v1Result.stem.snapped_mm >= 110) {
    flags.push('consider_bar_change')
  }

  // Generate rationale based on rider inputs
  const rationale: string[] = []

  // Pain point specific rationale (from old system)
  if (input.pain_points.includes('hands')) {
    rationale.push('Reduced forward reach to limit hand load.')
  }
  if (input.pain_points.includes('neck')) {
    rationale.push('Raised bar height to reduce neck extension.')
  }
  if (input.pain_points.includes('back')) {
    rationale.push('Shortened reach to reduce lower back strain.')
  }

  // Style-based rationale
  if (input.riding_style === 'comfort') {
    rationale.push('Comfort posture shortens reach and reduces drop.')
  }
  if (input.riding_style === 'race') {
    rationale.push('Race posture increases reach and drop for aerodynamics.')
  }

  // Flexibility-based rationale
  if (flexibility === 'low') {
    rationale.push('Limited flexibility requires more upright position.')
  }
  if (flexibility === 'high') {
    rationale.push('High flexibility allows for more aggressive position.')
  }

  // Add v1-specific notes to rationale
  rationale.push(...v1Result.notes.filter(note => !note.includes('Missing')))

  // Convert v1 confidence (0-1) to legacy percentage (40-95)
  const confidencePercentage = Math.round(40 + (v1Result.confidence * 55))

  // Map v1 results to legacy format
  return {
    target_reach_mm: v1Result.targetReach.mid_mm,
    target_drop_mm: Math.round((v1Result.targetDrop.min_mm + v1Result.targetDrop.max_mm) / 2),
    ideal_stem_mm: v1Result.stem.snapped_mm,
    ideal_stem_range_mm: [
      v1Result.stem.snapped_mm - 5,
      v1Result.stem.snapped_mm + 5,
    ],
    ideal_spacer_mm: v1Result.spacers.recommended_mm,
    ideal_spacer_range_mm: [
      v1Result.spacers.min_mm ?? v1Result.spacers.recommended_mm - 5,
      v1Result.spacers.max_mm ?? v1Result.spacers.recommended_mm + 5,
    ],
    recommended_bar_reach_category: recommendedBar,
    current_effective_reach_mm: Math.round(currentEffectiveReach),
    reach_delta_mm: Math.round(currentEffectiveReach - v1Result.targetReach.mid_mm),
    confidence: confidencePercentage,
    flags,
    rationale,
  }
}

/**
 * Get the stem size range allowed around a snapped value
 *
 * @param snappedStem - The snapped stem length
 * @returns Array of allowed stem sizes within ±10mm
 */
export function getAllowedStemRange(snappedStem: number): number[] {
  return STEM_SIZES.filter(
    size => size >= snappedStem - 10 && size <= snappedStem + 10
  )
}

/**
 * Convert bar category to millimeter value
 *
 * @param category - Bar reach category
 * @returns Reach value in millimeters
 */
export function getBarReachMm(category: BarCategory): number {
  return BAR_REACH_MM[category]
}
