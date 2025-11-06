/**
 * Bike Fit Calculator - Phase 4 Complete Spec
 *
 * Calculates personalized cockpit recommendations based on:
 * - Rider measurements (height, inseam, torso, arm length)
 * - Flexibility and riding style preferences
 * - Current pain points
 * - Frame geometry (stack and reach)
 * - Current setup (stem, spacers, bar reach)
 */

// ===== Types =====

export type RidingStyle = 'comfort' | 'endurance' | 'race'
export type BarCategory = 'short' | 'med' | 'long'

export type FitInput = {
  torso_cm: number
  arm_cm: number
  flexibility_level: 1 | 2 | 3
  riding_style: RidingStyle
  pain_points: string[]
  frame_reach_mm: number
  stem_mm: number
  spacer_mm: number
  bar_reach_category: BarCategory
}

export type FitResult = {
  target_reach_mm: number
  target_drop_mm: number
  ideal_stem_mm: number
  ideal_stem_range_mm: [number, number]
  ideal_spacer_mm: number
  ideal_spacer_range_mm: [number, number]
  recommended_bar_reach_category: BarCategory
  current_effective_reach_mm: number
  reach_delta_mm: number
  confidence: number
  flags: string[]
  rationale: string[]
}

// ===== Constants =====

const BAR_REACH_MAP: Record<BarCategory, number> = {
  short: 72,   // typical 70–75mm
  med: 78,     // typical 75–80mm
  long: 86     // typical 85mm+
}

const HOOD_TROUGH_OFFSET = 25
// Distance from bar clamp center to hood trough center horizontally (approx)

const STEM_SNAP_SIZES = [40, 50, 60, 70, 80, 90, 100, 110]

const STEM_RANGE_PAD = 5  // ±5mm safe band
const SPACER_RANGE_PAD = 5 // ±5mm safe band

// Style target drops (hoods relative to saddle top) – conservative gravel leaning
const TARGET_DROP_BY_STYLE: Record<RidingStyle, [number, number]> = {
  comfort: [10, 25],    // mm below saddle
  endurance: [20, 45],
  race: [45, 80]
}

// ===== Utility Functions =====

export function nearest(list: number[], x: number): number {
  return list.reduce((p, c) => Math.abs(c - x) < Math.abs(p - x) ? c : p, list[0])
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

// ===== Main Fit Calculation =====

export function calculateFit(input: FitInput): FitResult {
  const {
    torso_cm,
    arm_cm,
    flexibility_level,
    riding_style,
    pain_points,
    frame_reach_mm,
    stem_mm,
    spacer_mm,
    bar_reach_category
  } = input

  // ===== STEP 1: Compute Target Reach =====
  let targetReach = torso_cm * 10 * 0.43 + arm_cm * 10 * 0.35

  // Flexibility modifiers
  if (flexibility_level === 1) targetReach -= 15
  if (flexibility_level === 3) targetReach += 10

  // Riding style modifiers
  if (riding_style === 'comfort') targetReach -= 20
  if (riding_style === 'race') targetReach += 15

  // Pain point modifiers
  if (pain_points.includes('hands')) targetReach -= 10
  if (pain_points.includes('neck')) targetReach -= 10
  if (pain_points.includes('back')) targetReach -= 5

  // Guardrails
  targetReach = clamp(targetReach, 350, 520)

  // ===== STEP 2: Compute Target Drop =====
  const [dMin, dMax] = TARGET_DROP_BY_STYLE[riding_style]
  let targetDrop = (dMin + dMax) / 2

  // Flexibility adjustments
  if (flexibility_level === 1) targetDrop -= 8   // Tighter hips/hamstrings
  if (flexibility_level === 3) targetDrop += 5

  // Pain point adjustments
  if (pain_points.includes('neck')) targetDrop -= 5
  if (pain_points.includes('hands')) targetDrop -= 3

  // Clamp to style range
  targetDrop = clamp(targetDrop, dMin, dMax)

  // ===== STEP 3: Current Effective Reach =====
  const barReach = BAR_REACH_MAP[bar_reach_category]
  const currentEffectiveReach = frame_reach_mm + stem_mm + barReach + HOOD_TROUGH_OFFSET

  // ===== STEP 4: Solve for Ideal Stem Length =====
  let idealStemRaw = targetReach - (frame_reach_mm + barReach + HOOD_TROUGH_OFFSET)
  let recommendedBar = bar_reach_category
  let snappedStem = nearest(STEM_SNAP_SIZES, idealStemRaw)

  // Bar category optimization if stem is out of bounds
  if (snappedStem < 40) {
    if (recommendedBar !== 'short') {
      recommendedBar = 'short'
      idealStemRaw = targetReach - (frame_reach_mm + BAR_REACH_MAP.short + HOOD_TROUGH_OFFSET)
      snappedStem = nearest(STEM_SNAP_SIZES, idealStemRaw)
    }
  }
  if (snappedStem > 110) {
    if (recommendedBar !== 'long') {
      recommendedBar = 'long'
      idealStemRaw = targetReach - (frame_reach_mm + BAR_REACH_MAP.long + HOOD_TROUGH_OFFSET)
      snappedStem = nearest(STEM_SNAP_SIZES, idealStemRaw)
    }
  }

  const stemRange: [number, number] = [
    snappedStem - STEM_RANGE_PAD,
    snappedStem + STEM_RANGE_PAD
  ]

  // ===== STEP 5: Solve for Ideal Spacer Stack =====
  const targetBandMid = (dMin + dMax) / 2
  let spacerDelta = 0
  const isHigherDesired = targetDrop < targetBandMid

  if (isHigherDesired) spacerDelta += 5
  if (pain_points.includes('neck')) spacerDelta += 5
  if (!isHigherDesired && flexibility_level === 3) spacerDelta -= 5

  let idealSpacers = clamp(spacer_mm + spacerDelta, 0, 30)
  const spacerRange: [number, number] = [
    clamp(idealSpacers - SPACER_RANGE_PAD, 0, 30),
    clamp(idealSpacers + SPACER_RANGE_PAD, 0, 30)
  ]

  // ===== STEP 6: Confidence & Flags =====
  let confidence = 85
  const flags: string[] = []

  if (snappedStem <= 40 && targetReach < currentEffectiveReach) {
    flags.push('frame_maybe_too_long')
  }
  if (snappedStem >= 110 && targetReach > currentEffectiveReach) {
    flags.push('frame_maybe_too_short')
  }
  if (snappedStem <= 40 || snappedStem >= 110) {
    flags.push('consider_bar_change')
  }

  if (snappedStem <= 40 || snappedStem >= 110) confidence -= 25
  if (flexibility_level === 1 && riding_style === 'race') confidence -= 10
  if ((pain_points?.length || 0) >= 2) confidence -= 5

  confidence = clamp(confidence, 40, 95)

  // ===== STEP 7: Reach Delta =====
  const reachDelta = currentEffectiveReach - targetReach

  // ===== STEP 8: Rationale =====
  const rationale: string[] = []

  if (pain_points.includes('hands')) {
    rationale.push('Reduced forward reach to limit hand load.')
  }
  if (pain_points.includes('neck')) {
    rationale.push('Raised bar height to reduce neck extension.')
  }
  if (pain_points.includes('back')) {
    rationale.push('Shortened reach to reduce lower back strain.')
  }
  if (riding_style === 'comfort') {
    rationale.push('Comfort posture shortens reach and reduces drop.')
  }
  if (riding_style === 'race') {
    rationale.push('Race posture increases reach and drop for aerodynamics.')
  }
  if (flexibility_level === 1) {
    rationale.push('Limited flexibility requires more upright position.')
  }
  if (flexibility_level === 3) {
    rationale.push('High flexibility allows for more aggressive position.')
  }

  // ===== Return Result =====
  return {
    target_reach_mm: Math.round(targetReach),
    target_drop_mm: Math.round(targetDrop),
    ideal_stem_mm: snappedStem,
    ideal_stem_range_mm: [stemRange[0], stemRange[1]],
    ideal_spacer_mm: Math.round(idealSpacers),
    ideal_spacer_range_mm: [spacerRange[0], spacerRange[1]],
    recommended_bar_reach_category: recommendedBar,
    current_effective_reach_mm: Math.round(currentEffectiveReach),
    reach_delta_mm: Math.round(reachDelta),
    confidence,
    flags,
    rationale
  }
}

// ===== Helper Functions for Display =====

export function getBarReachRange(category: BarCategory): [number, number] {
  switch (category) {
    case 'short': return [70, 75]
    case 'med': return [75, 80]
    case 'long': return [85, 95]
  }
}

export function getBarReachValue(category: BarCategory): number {
  return BAR_REACH_MAP[category]
}

export function getConfidenceLevel(score: number): {
  level: 'high' | 'medium' | 'low'
  label: string
  color: string
} {
  if (score >= 75) {
    return { level: 'high', label: 'High confidence', color: 'text-green-600' }
  } else if (score >= 55) {
    return { level: 'medium', label: 'Medium confidence', color: 'text-yellow-600' }
  } else {
    return { level: 'low', label: 'Low confidence - review recommended', color: 'text-orange-600' }
  }
}

export function getFlagMessage(flag: string): string {
  switch (flag) {
    case 'frame_maybe_too_long':
      return 'Frame reach may be too long for your proportions'
    case 'frame_maybe_too_short':
      return 'Frame reach may be too short for your proportions'
    case 'consider_bar_change':
      return 'Consider changing bar reach category for better fit'
    default:
      return flag
  }
}
