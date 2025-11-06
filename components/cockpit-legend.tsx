'use client'

import { COCKPIT_COLORS, DELTA_COLORS } from '@/lib/cockpit-viz'

type CockpitLegendProps = {
  deltas: {
    reach: number
    drop: number
    reachColor: 'green' | 'amber' | 'red'
    dropColor: 'green' | 'amber' | 'red'
  }
}

export function CockpitLegend({ deltas }: CockpitLegendProps) {
  return (
    <div className="space-y-4">
      {/* Cockpit Legend */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: COCKPIT_COLORS.current }}
          />
          <span className="font-medium">Current</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: COCKPIT_COLORS.target }}
          />
          <span className="font-medium">Recommended</span>
        </div>
      </div>

      {/* Delta Summary */}
      <div className="grid grid-cols-2 gap-4">
        {/* Reach Delta */}
        <div className="p-4 border border-border rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">Δ Reach</div>
          <div
            className="text-2xl font-bold"
            style={{ color: DELTA_COLORS[deltas.reachColor] }}
          >
            {deltas.reach > 0 ? '+' : ''}
            {deltas.reach}mm
          </div>
          <div className="text-xs mt-1">
            {Math.abs(deltas.reach) <= 3 ? (
              <span className="text-green-600 font-medium">✓ Perfect match</span>
            ) : Math.abs(deltas.reach) <= 10 ? (
              <span className="text-green-600">Within ideal range</span>
            ) : Math.abs(deltas.reach) <= 25 ? (
              <span className="text-yellow-600">Minor adjustment needed</span>
            ) : (
              <span className="text-red-600">Significant adjustment needed</span>
            )}
          </div>
        </div>

        {/* Drop Delta */}
        <div className="p-4 border border-border rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">Δ Drop</div>
          <div
            className="text-2xl font-bold"
            style={{ color: DELTA_COLORS[deltas.dropColor] }}
          >
            {deltas.drop > 0 ? '+' : ''}
            {deltas.drop}mm
          </div>
          <div className="text-xs mt-1">
            {Math.abs(deltas.drop) <= 3 ? (
              <span className="text-green-600 font-medium">✓ Perfect match</span>
            ) : Math.abs(deltas.drop) <= 10 ? (
              <span className="text-green-600">Within ideal range</span>
            ) : Math.abs(deltas.drop) <= 25 ? (
              <span className="text-yellow-600">Minor adjustment needed</span>
            ) : (
              <span className="text-red-600">Significant adjustment needed</span>
            )}
          </div>
        </div>
      </div>

      {/* Helper Text */}
      <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded text-xs text-blue-900 dark:text-blue-100">
        <strong>Ranges reflect comfort variance (±5mm).</strong> Small adjustments can make big comfort differences.
      </div>
    </div>
  )
}
