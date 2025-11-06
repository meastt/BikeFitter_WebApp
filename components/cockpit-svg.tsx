'use client'

import { SvgModel } from '@/lib/cockpit-viz'

type CockpitSvgProps = {
  model: SvgModel
}

export function CockpitSvg({ model }: CockpitSvgProps) {
  const W = model.width
  const H = model.height
  const P = model.padding

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      <defs>
        {/* Subtle grid pattern */}
        <pattern id="grid-sm" width="50" height="50" patternUnits="userSpaceOnUse">
          <path
            d="M 50 0 L 0 0 0 50"
            stroke="rgba(0,0,0,.06)"
            strokeWidth="1"
            fill="none"
          />
        </pattern>
      </defs>

      {/* White background */}
      <rect x="0" y="0" width={W} height={H} fill="white" />

      {/* Grid overlay */}
      <rect x={P} y={P} width={W - 2 * P} height={H - 2 * P} fill="url(#grid-sm)" />

      {/* Bold 100mm grid lines */}
      <g className="stroke-neutral-300" opacity="0.4">
        {Array.from({ length: 15 }, (_, i) => (
          <line
            key={`v-${i}`}
            x1={P + i * 100 * model.xScale}
            y1={P}
            x2={P + i * 100 * model.xScale}
            y2={H - P}
            strokeWidth="1"
          />
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <line
            key={`h-${i}`}
            x1={P}
            y1={P + i * 100 * model.yScale}
            x2={W - P}
            y2={P + i * 100 * model.yScale}
            strokeWidth="1"
          />
        ))}
      </g>

      {/* Origin (BB) */}
      <circle cx={P} cy={H - P} r="4" fill="black" />

      {/* Frame "L" (stack/reach) */}
      <g className="stroke-neutral-400">
        {/* Reach line (horizontal from BB) */}
        <line
          x1={P}
          y1={H - P}
          x2={P + model.frameReachPx}
          y2={H - P}
          strokeWidth="2"
        />
        {/* Stack line (vertical to head top) */}
        <line
          x1={P + model.frameReachPx}
          y1={H - P}
          x2={P + model.frameReachPx}
          y2={H - P - model.frameStackPx}
          strokeWidth="2"
        />
        {/* Head tube stub */}
        <line
          x1={P + model.frameReachPx}
          y1={H - P - model.frameStackPx}
          x2={P + model.frameReachPx + 16}
          y2={H - P - model.frameStackPx}
          strokeWidth="2"
        />
      </g>

      {/* Current cockpit (grey-500) */}
      <g className="stroke-neutral-500">
        {/* Stem */}
        <line
          x1={model.cur.stem.x1}
          y1={model.cur.stem.y1}
          x2={model.cur.stem.x2}
          y2={model.cur.stem.y2}
          strokeWidth="2"
        />
        {/* Bar reach */}
        <line
          x1={model.cur.bar.x1}
          y1={model.cur.bar.y1}
          x2={model.cur.bar.x2}
          y2={model.cur.bar.y2}
          strokeWidth="2"
        />
        {/* Hood point */}
        <circle
          cx={model.cur.hood.x}
          cy={model.cur.hood.y}
          r="5"
          fill="white"
          stroke="#6B7280"
          strokeWidth="2"
        />
      </g>

      {/* Target cockpit (blue-600) */}
      <g className="stroke-blue-600">
        {/* Stem */}
        <line
          x1={model.tgt.stem.x1}
          y1={model.tgt.stem.y1}
          x2={model.tgt.stem.x2}
          y2={model.tgt.stem.y2}
          strokeWidth="3"
        />
        {/* Bar reach */}
        <line
          x1={model.tgt.bar.x1}
          y1={model.tgt.bar.y1}
          x2={model.tgt.bar.x2}
          y2={model.tgt.bar.y2}
          strokeWidth="3"
        />
        {/* Hood point */}
        <circle
          cx={model.tgt.hood.x}
          cy={model.tgt.hood.y}
          r="5"
          fill="white"
          stroke="#2563EB"
          strokeWidth="3"
        />
      </g>

      {/* Delta lines with foreignObject labels */}
      {Math.abs(model.deltas.reach.value) > 3 && (
        <g className={model.deltas.reach.color}>
          {/* Horizontal reach delta */}
          <line
            x1={model.cur.hood.x}
            y1={model.cur.hood.y + 20}
            x2={model.tgt.hood.x}
            y2={model.cur.hood.y + 20}
            strokeWidth="2"
            strokeDasharray="6 6"
            strokeLinecap="round"
          />
          {/* Label chip */}
          <foreignObject
            x={(model.cur.hood.x + model.tgt.hood.x) / 2 - 32}
            y={model.cur.hood.y + 20 - 22}
            width="64"
            height="22"
          >
            <div className="rounded bg-white/95 px-2 py-1 text-center text-xs border shadow-sm font-semibold">
              {model.deltas.reach.text}
            </div>
          </foreignObject>
        </g>
      )}

      {Math.abs(model.deltas.drop.value) > 3 && (
        <g className={model.deltas.drop.color}>
          {/* Vertical drop delta */}
          <line
            x1={model.tgt.hood.x + 20}
            y1={model.cur.hood.y}
            x2={model.tgt.hood.x + 20}
            y2={model.tgt.hood.y}
            strokeWidth="2"
            strokeDasharray="6 6"
            strokeLinecap="round"
          />
          {/* Label chip */}
          <foreignObject
            x={model.tgt.hood.x + 26}
            y={(model.cur.hood.y + model.tgt.hood.y) / 2 - 11}
            width="64"
            height="22"
          >
            <div className="rounded bg-white/95 px-2 py-1 text-center text-xs border shadow-sm font-semibold">
              {model.deltas.drop.text}
            </div>
          </foreignObject>
        </g>
      )}

      {/* Legend labels */}
      <g className="text-xs">
        {/* Current label */}
        <text
          x={model.cur.hood.x}
          y={model.cur.hood.y - 12}
          textAnchor="middle"
          fill="#6B7280"
          fontWeight="500"
          fontSize="11"
        >
          Current
        </text>
        {/* Target label */}
        <text
          x={model.tgt.hood.x}
          y={model.tgt.hood.y - 12}
          textAnchor="middle"
          fill="#2563EB"
          fontWeight="500"
          fontSize="11"
        >
          Target
        </text>
      </g>
    </svg>
  )
}
