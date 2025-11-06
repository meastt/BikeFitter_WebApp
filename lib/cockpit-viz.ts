/**
 * Cockpit Visualization - Phase 5
 *
 * Types and utilities for rendering current vs. target cockpit geometry
 */

import { BarCategory, getBarReachValue } from './fit-calculator'

// ===== Types =====

export type VizInput = {
  // frame & cockpit (current)
  frame: {
    stack_mm: number
    reach_mm: number
    head_tube_length_mm?: number
  }
  current: {
    stem_mm: number
    spacer_mm: number
    bar_reach_mm: number // resolved from category
    hood_offset_mm: number // 25 (Phase 4 const)
  }
  // recommendations / targets
  target: {
    target_reach_mm: number
    target_drop_mm: number // relative to saddle (display as -X mm)
    ideal_stem_mm: number
    ideal_spacer_mm: number
    ideal_bar_reach_mm: number
    ideal_stem_range_mm: [number, number]
    ideal_spacer_range_mm: [number, number]
    reach_delta_mm: number // current - target
    confidence: number
    flags: string[]
  }
  // optional for nicer scaling
  saddle_height_mm?: number
}

export type SvgModel = {
  width: number
  height: number
  padding: number
  frameReachPx: number
  frameStackPx: number
  xScale: number
  yScale: number
  cur: {
    stem: { x1: number; y1: number; x2: number; y2: number }
    bar: { x1: number; y1: number; x2: number; y2: number }
    hood: { x: number; y: number }
  }
  tgt: {
    stem: { x1: number; y1: number; x2: number; y2: number }
    bar: { x1: number; y1: number; x2: number; y2: number }
    hood: { x: number; y: number }
  }
  deltas: {
    reach: {
      value: number
      color: string
      text: string
    }
    drop: {
      value: number
      color: string
      text: string
    }
  }
}

// ===== Constants =====

const HOOD_RISE_PX = 35 // Visual offset for hood above bar clamp
const HOOD_OFFSET = 25 // mm horizontal offset from bar to hood trough

// ===== Color Semantics =====

export function getDeltaColor(delta: number): string {
  const abs = Math.abs(delta)
  if (abs <= 10) return 'stroke-green-500'
  if (abs <= 25) return 'stroke-amber-500'
  return 'stroke-red-500'
}

export function formatDelta(delta: number): string {
  return delta > 0 ? `+${delta} mm` : `${delta} mm`
}

// ===== Projection Utility =====

export function projectToSvgModel(
  viz: VizInput,
  overrides: { stem: number; spacers: number; barReach: number }
): SvgModel {
  const { frame, current, target } = viz
  const { stem, spacers, barReach } = overrides

  // Compute effective reaches
  const currentReach =
    frame.reach_mm + current.stem_mm + current.bar_reach_mm + current.hood_offset_mm
  const targetReach = target.target_reach_mm
  const liveReach = frame.reach_mm + stem + barReach + HOOD_OFFSET

  // Compute stack heights (at bar clamp)
  const currentStack = frame.stack_mm + current.spacer_mm
  const targetStack = frame.stack_mm + target.ideal_spacer_mm
  const liveStack = frame.stack_mm + spacers

  // Determine canvas size and scales
  const width = 720
  const height = 420
  const padding = 40

  // Max extents for scaling
  const maxReach = Math.max(currentReach, targetReach, liveReach) + 80
  const maxStack = Math.max(currentStack, targetStack, liveStack) + 60

  // Scales (mm → px)
  const xScale = (width - padding * 2) / maxReach
  const yScale = (height - padding * 2) / maxStack

  // Use the smaller scale to keep aspect ratio consistent
  const scale = Math.min(xScale, yScale)

  // Bottom-left corner (BB position)
  const bbX = padding
  const bbY = height - padding

  // Frame geometry
  const frameReachPx = frame.reach_mm * scale
  const frameStackPx = frame.stack_mm * scale

  const headTopX = bbX + frameReachPx
  const headTopY = bbY - frameStackPx

  // === Current Cockpit ===
  const currentStemPx = current.stem_mm * scale
  const currentBarPx = current.bar_reach_mm * scale
  const currentSpacerPx = current.spacer_mm * scale

  const currentStemEndX = headTopX + currentStemPx
  const currentStemEndY = headTopY - currentSpacerPx

  const currentBarEndX = currentStemEndX + currentBarPx
  const currentBarEndY = currentStemEndY

  const currentHoodX = currentBarEndX + HOOD_OFFSET * scale
  const currentHoodY = currentBarEndY - HOOD_RISE_PX

  // === Target Cockpit (using live overrides) ===
  const targetStemPx = stem * scale
  const targetBarPx = barReach * scale
  const targetSpacerPx = spacers * scale

  const targetStemEndX = headTopX + targetStemPx
  const targetStemEndY = headTopY - targetSpacerPx

  const targetBarEndX = targetStemEndX + targetBarPx
  const targetBarEndY = targetStemEndY

  const targetHoodX = targetBarEndX + HOOD_OFFSET * scale
  const targetHoodY = targetBarEndY - HOOD_RISE_PX

  // === Deltas ===
  const reachDelta = Math.round(liveReach - targetReach)
  const dropDelta = Math.round((targetHoodY - currentHoodY) / scale) // positive = lower

  const reachColor = getDeltaColor(reachDelta)
  const dropColor = getDeltaColor(dropDelta)

  return {
    width,
    height,
    padding,
    frameReachPx,
    frameStackPx,
    xScale: scale,
    yScale: scale,
    cur: {
      stem: {
        x1: headTopX,
        y1: headTopY - currentSpacerPx,
        x2: currentStemEndX,
        y2: currentStemEndY,
      },
      bar: {
        x1: currentStemEndX,
        y1: currentStemEndY,
        x2: currentBarEndX,
        y2: currentBarEndY,
      },
      hood: { x: currentHoodX, y: currentHoodY },
    },
    tgt: {
      stem: {
        x1: headTopX,
        y1: headTopY - targetSpacerPx,
        x2: targetStemEndX,
        y2: targetStemEndY,
      },
      bar: {
        x1: targetStemEndX,
        y1: targetStemEndY,
        x2: targetBarEndX,
        y2: targetBarEndY,
      },
      hood: { x: targetHoodX, y: targetHoodY },
    },
    deltas: {
      reach: {
        value: reachDelta,
        color: reachColor,
        text: formatDelta(reachDelta),
      },
      drop: {
        value: dropDelta,
        color: dropColor,
        text: formatDelta(dropDelta),
      },
    },
  }
}

/**
 * Helper to build VizInput from bike/profile/fit data
 */
export function buildVizInput(params: {
  frameStackMm: number
  frameReachMm: number
  headTubeLengthMm?: number
  currentStemMm: number
  currentSpacerMm: number
  currentBarCategory: BarCategory
  targetReachMm: number
  targetDropMm: number
  idealStemMm: number
  idealSpacerMm: number
  idealBarCategory: BarCategory
  idealStemRange: [number, number]
  idealSpacerRange: [number, number]
  reachDelta: number
  confidence: number
  flags: string[]
  saddleHeightMm?: number
}): VizInput {
  return {
    frame: {
      stack_mm: params.frameStackMm,
      reach_mm: params.frameReachMm,
      head_tube_length_mm: params.headTubeLengthMm,
    },
    current: {
      stem_mm: params.currentStemMm,
      spacer_mm: params.currentSpacerMm,
      bar_reach_mm: getBarReachValue(params.currentBarCategory),
      hood_offset_mm: 25,
    },
    target: {
      target_reach_mm: params.targetReachMm,
      target_drop_mm: params.targetDropMm,
      ideal_stem_mm: params.idealStemMm,
      ideal_spacer_mm: params.idealSpacerMm,
      ideal_bar_reach_mm: getBarReachValue(params.idealBarCategory),
      ideal_stem_range_mm: params.idealStemRange,
      ideal_spacer_range_mm: params.idealSpacerRange,
      reach_delta_mm: params.reachDelta,
      confidence: params.confidence,
      flags: params.flags,
    },
    saddle_height_mm: params.saddleHeightMm,
  }
}
