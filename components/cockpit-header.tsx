'use client'

import { getConfidenceLevel, getFlagMessage } from '@/lib/fit-calculator'

type CockpitHeaderProps = {
  confidence: number
  flags: string[]
}

export function CockpitHeader({ confidence, flags }: CockpitHeaderProps) {
  const confidenceInfo = getConfidenceLevel(confidence)

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Confidence pill */}
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
          confidenceInfo.level === 'high'
            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-100'
            : confidenceInfo.level === 'medium'
            ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-100'
            : 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-100'
        }`}
      >
        Confidence: {confidence}/100
      </span>

      {/* Flag pills */}
      {flags.map((flag, i) => (
        <span
          key={i}
          className="inline-flex items-center rounded-full bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950 dark:text-amber-100 px-2.5 py-1 text-xs"
          title={getFlagMessage(flag)}
        >
          {getFlagMessage(flag)}
        </span>
      ))}
    </div>
  )
}
