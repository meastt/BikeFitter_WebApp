'use client'

import { getBarReachValue, type BarCategory } from '@/lib/fit-calculator'

type CockpitControlsProps = {
  stem: number
  onStem: (value: number) => void
  spacers: number
  onSpacers: (value: number) => void
  barCategory: BarCategory
  onBarCategory: (value: BarCategory) => void
  idealStem: number
  idealSpacers: number
  idealBarCategory: BarCategory
  reachDelta: number
  dropDelta: number
  onReset: () => void
  onApply: () => void
  isApplying?: boolean
}

const STEM_SIZES = [40, 50, 60, 70, 80, 90, 100, 110]

export function CockpitControls({
  stem,
  onStem,
  spacers,
  onSpacers,
  barCategory,
  onBarCategory,
  idealStem,
  idealSpacers,
  idealBarCategory,
  reachDelta,
  dropDelta,
  onReset,
  onApply,
  isApplying = false,
}: CockpitControlsProps) {
  // Find nearest stem size index
  const stemIndex = STEM_SIZES.indexOf(stem)

  const handleStemSlider = (value: number) => {
    onStem(STEM_SIZES[value])
  }

  // Live helper text
  const getReachHelper = () => {
    const abs = Math.abs(reachDelta)
    if (abs <= 3) return '✅ Perfect reach match'
    if (abs <= 10) return `Within +${abs}mm of ideal reach (excellent)`
    if (abs <= 25) return `${reachDelta > 0 ? 'Too long' : 'Too short'} by ${abs}mm (minor)`
    return `${reachDelta > 0 ? 'Too long' : 'Too short'} by ${abs}mm (significant)`
  }

  const getDropHelper = () => {
    const abs = Math.abs(dropDelta)
    if (abs <= 3) return '✅ Perfect bar height'
    if (abs <= 10) return `Bar height ${dropDelta > 0 ? 'lower' : 'higher'} by ${abs}mm (OK)`
    return `Bar ${dropDelta > 0 ? 'too low' : 'too high'} by ${abs}mm`
  }

  return (
    <div className="space-y-6">
      {/* 3-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stem Length */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Stem Length
          </label>
          <input
            type="range"
            min="0"
            max={STEM_SIZES.length - 1}
            value={stemIndex}
            onChange={(e) => handleStemSlider(Number(e.target.value))}
            className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            aria-label={`Stem length slider, current ${stem}mm, recommended ${idealStem}mm`}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-muted-foreground">40mm</span>
            <span className="text-lg font-bold text-blue-600">{stem}mm</span>
            <span className="text-xs text-muted-foreground">110mm</span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Ideal: {idealStem}mm
          </div>
        </div>

        {/* Spacer Stack */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Spacer Stack
          </label>
          <input
            type="range"
            min="0"
            max="30"
            step="5"
            value={spacers}
            onChange={(e) => onSpacers(Number(e.target.value))}
            className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            aria-label={`Spacer stack slider, current ${spacers}mm, recommended ${idealSpacers}mm`}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-muted-foreground">0mm</span>
            <span className="text-lg font-bold text-blue-600">{spacers}mm</span>
            <span className="text-xs text-muted-foreground">30mm</span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Ideal: {idealSpacers}mm
          </div>
        </div>

        {/* Bar Reach Category */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Bar Reach
          </label>
          <div className="flex gap-1 h-10">
            {(['short', 'med', 'long'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => onBarCategory(cat)}
                className={`flex-1 px-2 py-2 rounded border-2 transition-all text-xs font-medium ${
                  barCategory === cat
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-100'
                    : 'border-neutral-300 bg-white dark:bg-neutral-800 hover:border-blue-400'
                }`}
                aria-label={`Select ${cat} reach bars, ${getBarReachValue(cat)}mm`}
              >
                {cat === 'med' ? 'Med' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
          <div className="mt-2 text-center">
            <span className="text-lg font-bold text-blue-600">
              {getBarReachValue(barCategory)}mm
            </span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground text-center">
            Ideal: {idealBarCategory} ({getBarReachValue(idealBarCategory)}mm)
          </div>
        </div>
      </div>

      {/* Live helper text */}
      <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="text-sm space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-blue-900 dark:text-blue-100 font-medium">Reach:</span>
            <span className="text-blue-700 dark:text-blue-200">{getReachHelper()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-900 dark:text-blue-100 font-medium">Drop:</span>
            <span className="text-blue-700 dark:text-blue-200">{getDropHelper()}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onReset}
          className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors font-medium"
          aria-label="Reset to recommended values"
        >
          Reset
        </button>
        <button
          onClick={onApply}
          disabled={isApplying}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          aria-label="Apply changes to bike"
        >
          {isApplying ? 'Applying...' : 'Apply to Bike'}
        </button>
      </div>
    </div>
  )
}
