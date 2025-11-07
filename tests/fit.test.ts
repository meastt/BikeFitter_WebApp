/**
 * Unit tests for the bike fit calculation engine
 */

import { describe, it, expect } from 'vitest'
import {
  computeFitRecommendation,
  type RiderProfile,
  type FrameGeometry,
  type CurrentSetup,
} from '../lib/fit'

describe('computeFitRecommendation', () => {
  // Complete baseline data for testing
  const baselineRider: RiderProfile = {
    height_cm: 175,
    inseam_cm: 82,
    torso_length_cm: 60,
    arm_length_cm: 65,
    flexibility: 'medium',
    riding_style: 'endurance',
  }

  const baselineFrame: FrameGeometry = {
    stack_mm: 590,
    reach_mm: 386,
    head_tube_angle_deg: 72.5,
    seat_tube_angle_deg: 73.0,
    wheelbase_mm: 1020,
  }

  const baselineSetup: CurrentSetup = {
    stem_length_mm: 90,
    spacer_stack_mm: 20,
    bar_reach_mm: 80,
    hood_reach_offset_mm: 10,
    saddle_height_mm: 740,
    saddle_setback_mm: 25,
  }

  describe('Happy path with complete inputs', () => {
    it('should return full recommendation with confidence 1.0', () => {
      const result = computeFitRecommendation(
        baselineRider,
        baselineFrame,
        baselineSetup
      )

      // Check all required fields are present
      expect(result.targetReach).toBeDefined()
      expect(result.targetReach.min_mm).toBeTypeOf('number')
      expect(result.targetReach.mid_mm).toBeTypeOf('number')
      expect(result.targetReach.max_mm).toBeTypeOf('number')

      expect(result.targetDrop).toBeDefined()
      expect(result.targetDrop.min_mm).toBe(20) // endurance style
      expect(result.targetDrop.max_mm).toBe(40)

      expect(result.stem.snapped_mm).toBeTypeOf('number')
      expect(result.stem.allowed_mm).toBeInstanceOf(Array)
      expect(result.stem.basis_mm).toBeTypeOf('number')

      expect(result.spacers.recommended_mm).toBeTypeOf('number')
      expect(result.spacers.min_mm).toBeTypeOf('number')
      expect(result.spacers.max_mm).toBeTypeOf('number')

      expect(result.confidence).toBe(1.0)
      expect(result.notes).toBeInstanceOf(Array)
    })

    it('should calculate correct target reach for baseline rider', () => {
      const result = computeFitRecommendation(
        baselineRider,
        baselineFrame,
        baselineSetup
      )

      // Base: 60cm * 0.43 * 10 + 65cm * 0.35 * 10 = 258 + 227.5 = 485.5
      // Medium flexibility: +0, endurance style: +0
      // Total: 485.5, range: 480.5 - 490.5
      expect(result.targetReach.mid_mm).toBe(486) // rounded
      expect(result.targetReach.min_mm).toBe(481)
      expect(result.targetReach.max_mm).toBe(491)
    })

    it('should snap stem to nearest standard size', () => {
      const result = computeFitRecommendation(
        baselineRider,
        baselineFrame,
        baselineSetup
      )

      // Target mid: 486mm
      // Frame reach: 386mm, bar reach: 80mm, hood offset: 10mm = 476mm
      // Needed stem: 486 - 476 = 10mm
      // Should snap to 50mm (nearest in list)
      expect([50, 60, 70, 80, 90, 100, 110, 120]).toContain(result.stem.snapped_mm)
      expect(result.stem.basis_mm).toBe(10)
    })

    it('should provide allowed stem range', () => {
      const result = computeFitRecommendation(
        baselineRider,
        baselineFrame,
        baselineSetup
      )

      // Allowed stems should be within ±10mm of snapped value
      const snapped = result.stem.snapped_mm
      for (const stem of result.stem.allowed_mm) {
        expect(Math.abs(stem - snapped)).toBeLessThanOrEqual(10)
      }
    })
  })

  describe('Flexibility adjustments', () => {
    it('should reduce reach for low flexibility', () => {
      const lowFlexRider = { ...baselineRider, flexibility: 'low' as const }
      const mediumResult = computeFitRecommendation(baselineRider, baselineFrame, baselineSetup)
      const lowResult = computeFitRecommendation(lowFlexRider, baselineFrame, baselineSetup)

      // Low flexibility should subtract 15mm
      expect(lowResult.targetReach.mid_mm).toBe(mediumResult.targetReach.mid_mm - 15)
    })

    it('should increase reach for high flexibility', () => {
      const highFlexRider = { ...baselineRider, flexibility: 'high' as const }
      const mediumResult = computeFitRecommendation(baselineRider, baselineFrame, baselineSetup)
      const highResult = computeFitRecommendation(highFlexRider, baselineFrame, baselineSetup)

      // High flexibility should add 10mm
      expect(highResult.targetReach.mid_mm).toBe(mediumResult.targetReach.mid_mm + 10)
    })
  })

  describe('Riding style adjustments', () => {
    it('should reduce reach for comfort style', () => {
      const comfortRider = { ...baselineRider, riding_style: 'comfort' as const }
      const enduranceResult = computeFitRecommendation(baselineRider, baselineFrame, baselineSetup)
      const comfortResult = computeFitRecommendation(comfortRider, baselineFrame, baselineSetup)

      // Comfort should subtract 20mm
      expect(comfortResult.targetReach.mid_mm).toBe(enduranceResult.targetReach.mid_mm - 20)
    })

    it('should increase reach for race style', () => {
      const raceRider = { ...baselineRider, riding_style: 'race' as const }
      const enduranceResult = computeFitRecommendation(baselineRider, baselineFrame, baselineSetup)
      const raceResult = computeFitRecommendation(raceRider, baselineFrame, baselineSetup)

      // Race should add 15mm
      expect(raceResult.targetReach.mid_mm).toBe(enduranceResult.targetReach.mid_mm + 15)
    })

    it('should set correct drop range for comfort', () => {
      const comfortRider = { ...baselineRider, riding_style: 'comfort' as const }
      const result = computeFitRecommendation(comfortRider, baselineFrame, baselineSetup)

      expect(result.targetDrop.min_mm).toBe(10)
      expect(result.targetDrop.max_mm).toBe(20)
    })

    it('should set correct drop range for race', () => {
      const raceRider = { ...baselineRider, riding_style: 'race' as const }
      const result = computeFitRecommendation(raceRider, baselineFrame, baselineSetup)

      expect(result.targetDrop.min_mm).toBe(50)
      expect(result.targetDrop.max_mm).toBe(80)
    })
  })

  describe('Combined adjustments', () => {
    it('should apply both flexibility and riding style adjustments', () => {
      const raceHighRider = {
        ...baselineRider,
        flexibility: 'high' as const,
        riding_style: 'race' as const,
      }

      const baseResult = computeFitRecommendation(
        { ...baselineRider, flexibility: 'medium', riding_style: 'endurance' },
        baselineFrame,
        baselineSetup
      )
      const adjustedResult = computeFitRecommendation(raceHighRider, baselineFrame, baselineSetup)

      // High flexibility: +10, race style: +15 = +25 total
      expect(adjustedResult.targetReach.mid_mm).toBe(baseResult.targetReach.mid_mm + 25)
    })

    it('should handle negative combined adjustments', () => {
      const comfortLowRider = {
        ...baselineRider,
        flexibility: 'low' as const,
        riding_style: 'comfort' as const,
      }

      const baseResult = computeFitRecommendation(
        { ...baselineRider, flexibility: 'medium', riding_style: 'endurance' },
        baselineFrame,
        baselineSetup
      )
      const adjustedResult = computeFitRecommendation(comfortLowRider, baselineFrame, baselineSetup)

      // Low flexibility: -15, comfort style: -20 = -35 total
      expect(adjustedResult.targetReach.mid_mm).toBe(baseResult.targetReach.mid_mm - 35)
    })
  })

  describe('Missing data handling', () => {
    it('should reduce confidence when bar_reach_mm is missing', () => {
      const incompleteSetup = { ...baselineSetup, bar_reach_mm: 0 }
      const result = computeFitRecommendation(baselineRider, baselineFrame, incompleteSetup)

      expect(result.confidence).toBeLessThan(1.0)
      expect(result.confidence).toBeGreaterThanOrEqual(0.3)
      expect(result.notes.length).toBeGreaterThan(0)
    })

    it('should reduce confidence when stem_length_mm is missing', () => {
      const incompleteSetup = { ...baselineSetup, stem_length_mm: 0 }
      const result = computeFitRecommendation(baselineRider, baselineFrame, incompleteSetup)

      expect(result.confidence).toBeLessThan(1.0)
      expect(result.notes.some(note => note.includes('stem length'))).toBe(true)
    })

    it('should reduce confidence when frame data is missing', () => {
      const incompleteFrame = { ...baselineFrame, reach_mm: 0 }
      const result = computeFitRecommendation(baselineRider, incompleteFrame, baselineSetup)

      expect(result.confidence).toBeLessThan(1.0)
      expect(result.notes.some(note => note.includes('frame reach'))).toBe(true)
    })

    it('should handle multiple missing fields', () => {
      const incompleteSetup = {
        ...baselineSetup,
        bar_reach_mm: 0,
        stem_length_mm: 0,
      }
      const result = computeFitRecommendation(baselineRider, baselineFrame, incompleteSetup)

      // Should lose 0.15 * 2 = 0.30 confidence
      expect(result.confidence).toBe(0.7)
    })

    it('should still return valid results with missing data', () => {
      const incompleteSetup = { ...baselineSetup, bar_reach_mm: 0 }
      const result = computeFitRecommendation(baselineRider, baselineFrame, incompleteSetup)

      // Should still have valid structure
      expect(result.targetReach.mid_mm).toBeGreaterThan(0)
      expect(result.stem.snapped_mm).toBeGreaterThan(0)
    })
  })

  describe('Stem snapping edge cases', () => {
    it('should snap 65mm to nearest (60 or 70)', () => {
      // Create setup that results in 65mm needed stem
      // Target: 486mm, Frame + bar + hood = 421mm → stem = 65mm
      const customFrame = { ...baselineFrame, reach_mm: 331 }
      const customSetup = { ...baselineSetup, bar_reach_mm: 80, hood_reach_offset_mm: 10 }

      const result = computeFitRecommendation(baselineRider, customFrame, customSetup)

      // 65 is exactly between 60 and 70
      expect(result.stem.basis_mm).toBe(65)
      expect([60, 70]).toContain(result.stem.snapped_mm)
    })

    it('should snap 55mm to nearest (50 or 60)', () => {
      const customFrame = { ...baselineFrame, reach_mm: 341 }
      const customSetup = { ...baselineSetup, bar_reach_mm: 80, hood_reach_offset_mm: 10 }

      const result = computeFitRecommendation(baselineRider, customFrame, customSetup)

      expect(result.stem.basis_mm).toBe(55)
      expect([50, 60]).toContain(result.stem.snapped_mm)
    })

    it('should snap 45mm to 50mm (minimum)', () => {
      const customFrame = { ...baselineFrame, reach_mm: 351 }
      const customSetup = { ...baselineSetup, bar_reach_mm: 80, hood_reach_offset_mm: 10 }

      const result = computeFitRecommendation(baselineRider, customFrame, customSetup)

      expect(result.stem.basis_mm).toBe(45)
      expect(result.stem.snapped_mm).toBe(50)
    })

    it('should snap 115mm to nearest (110 or 120)', () => {
      const customFrame = { ...baselineFrame, reach_mm: 281 }
      const customSetup = { ...baselineSetup, bar_reach_mm: 80, hood_reach_offset_mm: 10 }

      const result = computeFitRecommendation(baselineRider, customFrame, customSetup)

      // 486 - (281 + 80 + 10) = 115mm, exactly between 110 and 120
      expect(result.stem.basis_mm).toBe(115)
      expect([110, 120]).toContain(result.stem.snapped_mm)
    })

    it('should include correct allowed stems for edge snapped values', () => {
      const customFrame = { ...baselineFrame, reach_mm: 351 }
      const result = computeFitRecommendation(baselineRider, customFrame, baselineSetup)

      // Snapped to 50mm, allowed should be 50-60 (±10mm but clipped to list)
      expect(result.stem.snapped_mm).toBe(50)
      expect(result.stem.allowed_mm).toEqual([50, 60])
    })
  })

  describe('Spacer calculation', () => {
    it('should return null range when insufficient data', () => {
      const minimalSetup = {
        stem_length_mm: 90,
        spacer_stack_mm: 0,
        bar_reach_mm: 80,
      }

      const result = computeFitRecommendation(baselineRider, baselineFrame, minimalSetup)

      // Should still have a recommended value but null range
      expect(result.spacers.recommended_mm).toBeTypeOf('number')
    })

    it('should provide range when frame stack and current spacers available', () => {
      const result = computeFitRecommendation(baselineRider, baselineFrame, baselineSetup)

      expect(result.spacers.min_mm).toBeTypeOf('number')
      expect(result.spacers.max_mm).toBeTypeOf('number')
      expect(result.spacers.recommended_mm).toBeGreaterThanOrEqual(result.spacers.min_mm!)
      expect(result.spacers.recommended_mm).toBeLessThanOrEqual(result.spacers.max_mm!)
    })

    it('should recommend current spacers when within calculated range', () => {
      const result = computeFitRecommendation(baselineRider, baselineFrame, baselineSetup)

      // Should default to current spacers (20mm) when reasonable
      expect(result.spacers.recommended_mm).toBe(baselineSetup.spacer_stack_mm)
    })
  })

  describe('Default hood reach offset', () => {
    it('should use 10mm when hood_reach_offset_mm not provided', () => {
      const setupNoHoodOffset = {
        ...baselineSetup,
        hood_reach_offset_mm: undefined,
      }

      const resultWithDefault = computeFitRecommendation(
        baselineRider,
        baselineFrame,
        setupNoHoodOffset
      )

      const resultWithExplicit = computeFitRecommendation(
        baselineRider,
        baselineFrame,
        { ...setupNoHoodOffset, hood_reach_offset_mm: 10 }
      )

      expect(resultWithDefault.stem.basis_mm).toBe(resultWithExplicit.stem.basis_mm)
    })

    it('should respect custom hood_reach_offset_mm', () => {
      const customOffset = { ...baselineSetup, hood_reach_offset_mm: 20 }

      const resultDefault = computeFitRecommendation(baselineRider, baselineFrame, baselineSetup)
      const resultCustom = computeFitRecommendation(baselineRider, baselineFrame, customOffset)

      // Increasing hood offset by 10mm means bar reaches 10mm further, so need 10mm less stem
      const expectedDifference = resultDefault.stem.basis_mm - 10
      expect(Math.abs(resultCustom.stem.basis_mm - expectedDifference)).toBeLessThan(0.1)
    })
  })

  describe('Confidence minimum threshold', () => {
    it('should not drop below 0.3 confidence', () => {
      // Create scenario with many missing fields
      const incompleteRider = {
        torso_length_cm: 0,
        arm_length_cm: 0,
        flexibility: 'medium' as const,
        riding_style: 'endurance' as const,
      }
      const incompleteFrame = { stack_mm: 0, reach_mm: 0 }
      const incompleteSetup = {
        stem_length_mm: 0,
        spacer_stack_mm: 20,
        bar_reach_mm: 0,
      }

      const result = computeFitRecommendation(incompleteRider, incompleteFrame, incompleteSetup)

      expect(result.confidence).toBeGreaterThanOrEqual(0.3)
      expect(result.confidence).toBeLessThanOrEqual(1.0)
    })
  })
})
