/**
 * Bike Fit Calculator
 *
 * Calculates personalized cockpit recommendations based on:
 * - Rider measurements (height, inseam, torso, arm length)
 * - Flexibility and riding style preferences
 * - Current pain points
 * - Frame geometry (stack and reach)
 * - Current setup (stem, spacers, bar reach)
 */

type RiderProfile = {
  height_cm: number
  inseam_cm: number
  torso_cm?: number
  arm_cm?: number
  flexibility_level?: number  // 1=low, 2=medium, 3=high
  riding_style?: string       // comfort|endurance|race
  pain_points?: string[]      // hands, neck, back, saddle
}

type BikeGeometry = {
  stack_mm: number
  reach_mm: number
}

type CurrentSetup = {
  stem_mm?: number
  spacer_mm?: number
  bar_reach_category?: 'short' | 'med' | 'long'
}

type FitRecommendation = {
  target_reach_mm: number
  target_stack_mm: number
  ideal_stem_mm: number
  ideal_spacer_mm: number
  ideal_bar_reach_category: 'short' | 'med' | 'long'
  discomfort_score: number
  notes: string[]
}

/**
 * Calculate ideal cockpit position based on rider profile and bike geometry
 */
export function calculateFit(
  profile: RiderProfile,
  geometry: BikeGeometry,
  current?: CurrentSetup
): FitRecommendation {
  const notes: string[] = []

  // === STEP 1: Calculate base target reach ===
  // Use torso length as primary factor (longer torso = more reach needed)
  const torsoLength = profile.torso_cm || estimateTorso(profile.height_cm, profile.inseam_cm)
  const armLength = profile.arm_cm || estimateArm(profile.height_cm)

  // Base reach from frame + stem
  // Torso/inseam ratio affects ideal reach (more torso relative to legs = more reach)
  const torsoInseamRatio = torsoLength / profile.inseam_cm
  const baseReachMultiplier = 0.45 + (torsoInseamRatio - 0.6) * 0.3 // Typically 0.45-0.55
  let targetReach = profile.height_cm * 10 * baseReachMultiplier

  // === STEP 2: Adjust for riding style ===
  const ridingStyle = profile.riding_style || 'endurance'
  if (ridingStyle === 'comfort') {
    targetReach -= 20 // Shorter reach for more upright position
    notes.push('Comfort position: shortened reach for upright posture')
  } else if (ridingStyle === 'race') {
    targetReach += 15 // Longer reach for aggressive position
    notes.push('Race position: extended reach for aerodynamics')
  }

  // === STEP 3: Adjust for flexibility ===
  const flexibility = profile.flexibility_level || 2
  if (flexibility === 1) {
    targetReach -= 10 // Low flexibility = less aggressive
    notes.push('Low flexibility: reducing reach to avoid overextension')
  } else if (flexibility === 3) {
    targetReach += 10 // High flexibility = can handle more aggressive
  }

  // === STEP 4: Adjust for pain points ===
  const painPoints = profile.pain_points || []
  if (painPoints.includes('hands')) {
    targetReach -= 15
    notes.push('Hand discomfort: reducing reach to take weight off hands')
  }
  if (painPoints.includes('neck')) {
    notes.push('Neck discomfort: will raise bar height')
  }

  // === STEP 5: Calculate target stack ===
  // Stack is how high the bars are relative to saddle
  let targetStack = geometry.stack_mm

  // Flexibility affects preferred stack (more flexible = can go lower)
  if (flexibility === 1) {
    targetStack += 20 // Raise bars for less flexible riders
  } else if (flexibility === 3) {
    targetStack -= 10 // Lower bars for flexible riders
  }

  // Riding style affects stack
  if (ridingStyle === 'comfort') {
    targetStack += 25 // Much higher for comfort
  } else if (ridingStyle === 'race') {
    targetStack -= 15 // Lower for race position
  }

  // Pain points affect stack
  if (painPoints.includes('neck') || painPoints.includes('back')) {
    targetStack += 20
    notes.push('Back/neck pain: raising bar height to reduce strain')
  }

  // === STEP 6: Calculate stem length recommendation ===
  // Stem length makes up the difference between frame reach and target reach
  const frameReach = geometry.reach_mm
  const reachGap = targetReach - frameReach

  // Arm length affects stem preference
  const armMultiplier = armLength / 65 // 65cm is average
  let idealStem = Math.round((80 + reachGap) * armMultiplier / 10) * 10 // Round to nearest 10mm

  // Clamp to realistic range
  idealStem = Math.max(60, Math.min(130, idealStem))

  // === STEP 7: Calculate spacer stack recommendation ===
  const stackGap = targetStack - geometry.stack_mm
  let idealSpacer = Math.max(0, Math.round(stackGap / 5) * 5) // Round to nearest 5mm

  // Clamp to realistic range (most steerer tubes allow 0-50mm spacers)
  idealSpacer = Math.max(0, Math.min(50, idealSpacer))

  // === STEP 8: Recommend bar reach category ===
  // Bar reach is the horizontal distance from the bar clamp to the hoods
  let idealBarReach: 'short' | 'med' | 'long' = 'med'

  if (armLength < 60) {
    idealBarReach = 'short'
  } else if (armLength > 70) {
    idealBarReach = 'long'
  }

  // Pain in hands suggests shorter bar reach
  if (painPoints.includes('hands') && idealBarReach !== 'short') {
    idealBarReach = idealBarReach === 'long' ? 'med' : 'short'
    notes.push('Hand pain: suggesting shorter bar reach to reduce wrist extension')
  }

  // === STEP 9: Calculate discomfort score ===
  // How far is current setup from ideal? (0 = perfect, 100 = very far off)
  let discomfortScore = 0

  if (current?.stem_mm) {
    const stemDiff = Math.abs(current.stem_mm - idealStem)
    discomfortScore += Math.min(40, stemDiff / 2) // Up to 40 points for stem
  }

  if (current?.spacer_mm !== undefined) {
    const spacerDiff = Math.abs(current.spacer_mm - idealSpacer)
    discomfortScore += Math.min(30, spacerDiff) // Up to 30 points for spacers
  }

  if (current?.bar_reach_category && current.bar_reach_category !== idealBarReach) {
    discomfortScore += 20 // 20 points for wrong bar reach
  }

  // Pain points add to discomfort if setup isn't ideal
  discomfortScore += painPoints.length * 5

  discomfortScore = Math.round(Math.min(100, discomfortScore))

  return {
    target_reach_mm: Math.round(targetReach),
    target_stack_mm: Math.round(targetStack),
    ideal_stem_mm: idealStem,
    ideal_spacer_mm: idealSpacer,
    ideal_bar_reach_category: idealBarReach,
    discomfort_score: discomfortScore,
    notes
  }
}

/**
 * Estimate torso length from height and inseam if not provided
 */
function estimateTorso(heightCm: number, inseamCm: number): number {
  // Torso is roughly what's left after legs
  // Average person: inseam is ~45% of height, torso ~32%
  return Math.round(heightCm * 0.32)
}

/**
 * Estimate arm length from height if not provided
 */
function estimateArm(heightCm: number): number {
  // Arm length is roughly 38% of height
  return Math.round(heightCm * 0.38)
}

/**
 * Get bar reach range in mm for a category
 */
export function getBarReachRange(category: 'short' | 'med' | 'long'): [number, number] {
  switch (category) {
    case 'short': return [70, 75]
    case 'med': return [75, 80]
    case 'long': return [85, 95]
  }
}

/**
 * Get discomfort level label
 */
export function getDiscomfortLevel(score: number): {
  level: 'optimal' | 'minor' | 'moderate' | 'significant'
  label: string
  color: string
} {
  if (score < 15) {
    return { level: 'optimal', label: 'Optimal fit', color: 'text-green-600' }
  } else if (score < 35) {
    return { level: 'minor', label: 'Minor adjustments recommended', color: 'text-yellow-600' }
  } else if (score < 60) {
    return { level: 'moderate', label: 'Moderate issues detected', color: 'text-orange-600' }
  } else {
    return { level: 'significant', label: 'Significant fit issues', color: 'text-red-600' }
  }
}
