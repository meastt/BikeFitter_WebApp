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
  onReset,
  onApply,
  isApplying = false,
}: CockpitControlsProps) {
  // Find nearest stem size index
  const stemIndex = STEM_SIZES.indexOf(stem)

  const handleStemSlider = (value: number) => {
    onStem(STEM_SIZES[value])
  }

  return (
    <div className="space-y-6">
      {/* Stem Length */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Stem Length
          <span className="ml-2 text-xs text-muted-foreground">
            (Recommended: {idealStem}mm)
          </span>
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max={STEM_SIZES.length - 1}
            value={stemIndex}
            onChange={(e) => handleStemSlider(Number(e.target.value))}
            className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            aria-label={`Stem length slider, current ${stem}mm, recommended ${idealStem}mm`}
          />
          <div className="w-16 text-right font-semibold text-lg">{stem}mm</div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>40mm</span>
          <span>110mm</span>
        </div>
      </div>

      {/* Spacer Stack */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Spacer Stack
          <span className="ml-2 text-xs text-muted-foreground">
            (Recommended: {idealSpacers}mm)
          </span>
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="30"
            step="5"
            value={spacers}
            onChange={(e) => onSpacers(Number(e.target.value))}
            className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            aria-label={`Spacer stack slider, current ${spacers}mm, recommended ${idealSpacers}mm`}
          />
          <div className="w-16 text-right font-semibold text-lg">{spacers}mm</div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>0mm</span>
          <span>30mm</span>
        </div>
      </div>

      {/* Bar Reach Category */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Bar Reach Category
          <span className="ml-2 text-xs text-muted-foreground">
            (Recommended: {idealBarCategory})
          </span>
        </label>
        <div className="flex gap-2">
          {(['short', 'med', 'long'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => onBarCategory(cat)}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                barCategory === cat
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-100'
                  : 'border-neutral-300 bg-white dark:bg-neutral-800 hover:border-blue-400'
              }`}
              aria-label={`Select ${cat} reach bars, ${getBarReachValue(cat)}mm`}
            >
              <div className="capitalize text-sm">{cat}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {getBarReachValue(cat)}mm
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-border">
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

      {/* Helper Text */}
      <div className="text-xs text-muted-foreground">
        <p>
          💡 Adjust controls to explore different cockpit setups. Changes update the visualization in real-time.
        </p>
      </div>
    </div>
  )
}
