'use client'

import { getConfidenceLevel, getFlagMessage } from '@/lib/fit-calculator'

type CockpitHeaderProps = {
  confidence: number
  flags: string[]
}

export function CockpitHeader({ confidence, flags }: CockpitHeaderProps) {
  const confidenceInfo = getConfidenceLevel(confidence)

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Cockpit Delta</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Visualize and adjust your fit recommendations
          </p>
        </div>

        {/* Confidence Pill */}
        <div className="flex flex-col items-end gap-2">
          <div
            className={`px-4 py-2 rounded-full font-semibold text-sm ${
              confidenceInfo.level === 'high'
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100'
                : confidenceInfo.level === 'medium'
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-100'
                : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-100'
            }`}
          >
            Confidence: {confidence}/100
          </div>
          <div className={`text-xs font-medium ${confidenceInfo.color}`}>
            {confidenceInfo.label}
          </div>
        </div>
      </div>

      {/* Flags */}
      {flags.length > 0 && (
        <div className="p-4 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-orange-600 text-lg">⚠️</span>
            <div className="flex-1">
              <div className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-1">
                Fit Considerations:
              </div>
              <ul className="text-sm space-y-1">
                {flags.map((flag, i) => (
                  <li key={i} className="text-orange-700 dark:text-orange-200">
                    • {getFlagMessage(flag)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
