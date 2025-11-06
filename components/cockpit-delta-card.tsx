'use client'

import { useState, useMemo, useRef } from 'react'
import { VizInput, projectToSvgModel } from '@/lib/cockpit-viz'
import { CockpitSvg } from './cockpit-svg'
import { CockpitControls } from './cockpit-controls'
import { CockpitHeader } from './cockpit-header'
import { CockpitLegend } from './cockpit-legend'
import { getBarReachValue, type BarCategory } from '@/lib/fit-calculator'
import { updateBikeCockpit } from '@/app/bikes/[id]/actions'
import { useRouter } from 'next/navigation'
import { toPng } from 'html-to-image'

type CockpitDeltaCardProps = {
  viz: VizInput
  bikeId: string
  currentBarCategory: BarCategory
}

export function CockpitDeltaCard({ viz, bikeId, currentBarCategory }: CockpitDeltaCardProps) {
  const router = useRouter()
  const svgRef = useRef<HTMLDivElement>(null)

  // Local state for live adjustments
  const [stem, setStem] = useState(viz.target.ideal_stem_mm)
  const [spacers, setSpacers] = useState(viz.target.ideal_spacer_mm)
  const [barCategory, setBarCategory] = useState<BarCategory>(
    getBarReachValue(currentBarCategory) === viz.current.bar_reach_mm
      ? currentBarCategory
      : (Object.entries({ short: 72, med: 78, long: 86 }).find(
          ([_, val]) => val === viz.target.ideal_bar_reach_mm
        )?.[0] as BarCategory) || 'med'
  )
  const [isApplying, setIsApplying] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Compute SVG model with current overrides
  const model = useMemo(
    () =>
      projectToSvgModel(viz, {
        stem,
        spacers,
        barReach: getBarReachValue(barCategory),
      }),
    [viz, stem, spacers, barCategory]
  )

  // Reset to recommended values
  const handleReset = () => {
    setStem(viz.target.ideal_stem_mm)
    setSpacers(viz.target.ideal_spacer_mm)

    // Find bar category from ideal bar reach
    const idealCategory = (Object.entries({
      short: 72,
      med: 78,
      long: 86,
    }).find(([_, val]) => val === viz.target.ideal_bar_reach_mm)?.[0] ||
      'med') as BarCategory

    setBarCategory(idealCategory)
  }

  // Apply changes to bike
  const handleApply = async () => {
    try {
      setIsApplying(true)

      await updateBikeCockpit(bikeId, {
        stem_mm: stem,
        spacer_mm: spacers,
        bar_reach_category: barCategory,
      })

      // Show success message (you could use toast here)
      alert('✓ Cockpit settings applied successfully!')

      // Refresh the page to show updated data
      router.refresh()
    } catch (error) {
      console.error('Failed to apply cockpit settings:', error)
      alert('Failed to apply settings. Please try again.')
    } finally {
      setIsApplying(false)
    }
  }

  // Export as PNG
  const handleExport = async () => {
    if (!svgRef.current) return

    try {
      setIsExporting(true)

      const dataUrl = await toPng(svgRef.current, {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      })

      // Download the image
      const link = document.createElement('a')
      link.download = `cockpit-fit-${bikeId}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('Failed to export image:', error)
      alert('Failed to export image. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  // Check if we're at perfect match
  const isPerfectMatch =
    Math.abs(model.deltas.reach) <= 3 && Math.abs(model.deltas.drop) <= 3

  return (
    <div className="rounded-2xl border border-border p-6 space-y-6 bg-white dark:bg-neutral-900">
      {/* Header */}
      <CockpitHeader confidence={viz.target.confidence} flags={viz.target.flags} />

      {/* Perfect Match Banner */}
      {isPerfectMatch && (
        <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg text-center">
          <div className="text-2xl mb-1">✅</div>
          <div className="font-semibold text-green-900 dark:text-green-100">
            You're dialed! Save this setup.
          </div>
          <div className="text-sm text-green-700 dark:text-green-200 mt-1">
            Your current position is within 3mm of the ideal reach and drop.
          </div>
        </div>
      )}

      {/* Visualization */}
      <div
        ref={svgRef}
        className="p-4 border border-border rounded-lg bg-neutral-50 dark:bg-neutral-800"
      >
        <CockpitSvg model={model} />
      </div>

      {/* Legend */}
      <CockpitLegend deltas={model.deltas} />

      {/* Controls */}
      <div className="pt-6 border-t border-border">
        <h3 className="text-lg font-semibold mb-4">Adjust Cockpit</h3>
        <CockpitControls
          stem={stem}
          onStem={setStem}
          spacers={spacers}
          onSpacers={setSpacers}
          barCategory={barCategory}
          onBarCategory={setBarCategory}
          idealStem={viz.target.ideal_stem_mm}
          idealSpacers={viz.target.ideal_spacer_mm}
          idealBarCategory={
            (Object.entries({ short: 72, med: 78, long: 86 }).find(
              ([_, val]) => val === viz.target.ideal_bar_reach_mm
            )?.[0] || 'med') as BarCategory
          }
          onReset={handleReset}
          onApply={handleApply}
          isApplying={isApplying}
        />
      </div>

      {/* Export Button */}
      <div className="pt-4 border-t border-border">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Export visualization as PNG image"
        >
          {isExporting ? 'Exporting...' : '📸 Export as PNG'}
        </button>
      </div>
    </div>
  )
}
