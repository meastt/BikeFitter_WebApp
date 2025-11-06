'use client'

import { SvgModel, COCKPIT_COLORS, DELTA_COLORS } from '@/lib/cockpit-viz'
import { useState } from 'react'

type CockpitSvgProps = {
  model: SvgModel
}

export function CockpitSvg({ model }: CockpitSvgProps) {
  const [hoveredDelta, setHoveredDelta] = useState<'reach' | 'drop' | null>(null)
  const { size, frame, current, target, deltas } = model

  // Grid lines every 50mm
  const gridLines: { x1: number; y1: number; x2: number; y2: number }[] = []
  const gridStep = 50 * model.scale.xScale

  // Vertical grid lines
  for (let x = size.padding; x < size.width - size.padding; x += gridStep) {
    gridLines.push({
      x1: x,
      y1: size.padding,
      x2: x,
      y2: size.height - size.padding,
    })
  }

  // Horizontal grid lines
  for (let y = size.padding; y < size.height - size.padding; y += gridStep) {
    gridLines.push({
      x1: size.padding,
      y1: y,
      x2: size.width - size.padding,
      y2: y,
    })
  }

  return (
    <svg
      width={size.width}
      height={size.height}
      className="w-full h-auto"
      viewBox={`0 0 ${size.width} ${size.height}`}
    >
      {/* Background */}
      <rect width={size.width} height={size.height} fill="transparent" />

      {/* Grid */}
      <g opacity="0.15">
        {gridLines.map((line, i) => (
          <line
            key={i}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={COCKPIT_COLORS.grid}
            strokeWidth="1"
            strokeDasharray="2,2"
          />
        ))}
      </g>

      {/* Frame geometry (simplified) */}
      <g id="frame">
        {/* Reach line (horizontal from BB) */}
        <line
          x1={frame.reachLine.x1}
          y1={frame.reachLine.y1}
          x2={frame.reachLine.x2}
          y2={frame.reachLine.y2}
          stroke={COCKPIT_COLORS.frame}
          strokeWidth="2"
          opacity="0.4"
        />

        {/* Stack line (vertical to head top) */}
        <line
          x1={frame.stackLine.x1}
          y1={frame.stackLine.y1}
          x2={frame.stackLine.x2}
          y2={frame.stackLine.y2}
          stroke={COCKPIT_COLORS.frame}
          strokeWidth="2"
          opacity="0.4"
        />

        {/* BB circle */}
        <circle
          cx={frame.bb.x}
          cy={frame.bb.y}
          r="4"
          fill={COCKPIT_COLORS.frame}
          opacity="0.5"
        />

        {/* Head top circle */}
        <circle
          cx={frame.headTop.x}
          cy={frame.headTop.y}
          r="3"
          fill={COCKPIT_COLORS.frame}
          opacity="0.5"
        />
      </g>

      {/* Current cockpit (grey) */}
      <g id="current-cockpit">
        {/* Stem */}
        <line
          x1={frame.headTop.x}
          y1={current.stemEnd.y}
          x2={current.stemEnd.x}
          y2={current.stemEnd.y}
          stroke={COCKPIT_COLORS.current}
          strokeWidth="3"
        />

        {/* Bar reach */}
        <line
          x1={current.stemEnd.x}
          y1={current.stemEnd.y}
          x2={current.barEnd.x}
          y2={current.barEnd.y}
          stroke={COCKPIT_COLORS.current}
          strokeWidth="3"
        />

        {/* Hood point */}
        <circle
          cx={current.hood.x}
          cy={current.hood.y}
          r="5"
          fill={COCKPIT_COLORS.current}
          stroke="white"
          strokeWidth="2"
        />

        {/* Label */}
        <text
          x={current.hood.x}
          y={current.hood.y - 15}
          fontSize="12"
          fill={COCKPIT_COLORS.current}
          textAnchor="middle"
          fontWeight="500"
        >
          Current
        </text>
      </g>

      {/* Target cockpit (blue) */}
      <g id="target-cockpit">
        {/* Stem */}
        <line
          x1={frame.headTop.x}
          y1={target.stemEnd.y}
          x2={target.stemEnd.x}
          y2={target.stemEnd.y}
          stroke={COCKPIT_COLORS.target}
          strokeWidth="3"
        />

        {/* Bar reach */}
        <line
          x1={target.stemEnd.x}
          y1={target.stemEnd.y}
          x2={target.barEnd.x}
          y2={target.barEnd.y}
          stroke={COCKPIT_COLORS.target}
          strokeWidth="3"
        />

        {/* Hood point */}
        <circle
          cx={target.hood.x}
          cy={target.hood.y}
          r="5"
          fill={COCKPIT_COLORS.target}
          stroke="white"
          strokeWidth="2"
        />

        {/* Label */}
        <text
          x={target.hood.x}
          y={target.hood.y - 15}
          fontSize="12"
          fill={COCKPIT_COLORS.target}
          textAnchor="middle"
          fontWeight="500"
        >
          Target
        </text>
      </g>

      {/* Delta lines */}
      <g id="deltas">
        {/* Horizontal reach delta */}
        {Math.abs(deltas.reach) > 3 && (
          <g
            onMouseEnter={() => setHoveredDelta('reach')}
            onMouseLeave={() => setHoveredDelta(null)}
            className="cursor-pointer"
          >
            <line
              x1={current.hood.x}
              y1={current.hood.y + 20}
              x2={target.hood.x}
              y2={current.hood.y + 20}
              stroke={DELTA_COLORS[deltas.reachColor]}
              strokeWidth="2"
              strokeDasharray="4,4"
            />

            {/* Arrow heads */}
            <polygon
              points={`${current.hood.x},${current.hood.y + 20} ${current.hood.x + 5},${current.hood.y + 17} ${current.hood.x + 5},${current.hood.y + 23}`}
              fill={DELTA_COLORS[deltas.reachColor]}
            />
            <polygon
              points={`${target.hood.x},${current.hood.y + 20} ${target.hood.x - 5},${current.hood.y + 17} ${target.hood.x - 5},${current.hood.y + 23}`}
              fill={DELTA_COLORS[deltas.reachColor]}
            />

            {/* Label */}
            <text
              x={(current.hood.x + target.hood.x) / 2}
              y={current.hood.y + 15}
              fontSize="14"
              fontWeight="600"
              fill={DELTA_COLORS[deltas.reachColor]}
              textAnchor="middle"
            >
              {deltas.reach > 0 ? '+' : ''}{deltas.reach}mm
            </text>

            {/* Tooltip on hover */}
            {hoveredDelta === 'reach' && (
              <g>
                <rect
                  x={(current.hood.x + target.hood.x) / 2 - 70}
                  y={current.hood.y + 30}
                  width="140"
                  height="40"
                  fill="black"
                  opacity="0.8"
                  rx="4"
                />
                <text
                  x={(current.hood.x + target.hood.x) / 2}
                  y={current.hood.y + 45}
                  fontSize="11"
                  fill="white"
                  textAnchor="middle"
                >
                  Reach {deltas.reach > 0 ? 'increase' : 'decrease'}
                </text>
                <text
                  x={(current.hood.x + target.hood.x) / 2}
                  y={current.hood.y + 60}
                  fontSize="11"
                  fill="white"
                  textAnchor="middle"
                >
                  {Math.abs(deltas.reach)}mm adjustment
                </text>
              </g>
            )}
          </g>
        )}

        {/* Vertical drop delta */}
        {Math.abs(deltas.drop) > 3 && (
          <g
            onMouseEnter={() => setHoveredDelta('drop')}
            onMouseLeave={() => setHoveredDelta(null)}
            className="cursor-pointer"
          >
            <line
              x1={target.hood.x + 20}
              y1={current.hood.y}
              x2={target.hood.x + 20}
              y2={target.hood.y}
              stroke={DELTA_COLORS[deltas.dropColor]}
              strokeWidth="2"
              strokeDasharray="4,4"
            />

            {/* Arrow heads */}
            <polygon
              points={`${target.hood.x + 20},${current.hood.y} ${target.hood.x + 17},${current.hood.y + 5} ${target.hood.x + 23},${current.hood.y + 5}`}
              fill={DELTA_COLORS[deltas.dropColor]}
            />
            <polygon
              points={`${target.hood.x + 20},${target.hood.y} ${target.hood.x + 17},${target.hood.y - 5} ${target.hood.x + 23},${target.hood.y - 5}`}
              fill={DELTA_COLORS[deltas.dropColor]}
            />

            {/* Label */}
            <text
              x={target.hood.x + 30}
              y={(current.hood.y + target.hood.y) / 2 + 5}
              fontSize="14"
              fontWeight="600"
              fill={DELTA_COLORS[deltas.dropColor]}
              textAnchor="start"
            >
              {deltas.drop > 0 ? '+' : ''}{deltas.drop}mm
            </text>

            {/* Tooltip on hover */}
            {hoveredDelta === 'drop' && (
              <g>
                <rect
                  x={target.hood.x + 50}
                  y={(current.hood.y + target.hood.y) / 2 - 20}
                  width="120"
                  height="40"
                  fill="black"
                  opacity="0.8"
                  rx="4"
                />
                <text
                  x={target.hood.x + 110}
                  y={(current.hood.y + target.hood.y) / 2 - 5}
                  fontSize="11"
                  fill="white"
                  textAnchor="middle"
                >
                  Drop {deltas.drop > 0 ? 'increase' : 'decrease'}
                </text>
                <text
                  x={target.hood.x + 110}
                  y={(current.hood.y + target.hood.y) / 2 + 10}
                  fontSize="11"
                  fill="white"
                  textAnchor="middle"
                >
                  {Math.abs(deltas.drop)}mm adjustment
                </text>
              </g>
            )}
          </g>
        )}
      </g>

      {/* Dimension labels */}
      <g id="dimensions" opacity="0.4">
        <text
          x={frame.bb.x + (frame.headTop.x - frame.bb.x) / 2}
          y={frame.bb.y + 25}
          fontSize="10"
          fill={COCKPIT_COLORS.frame}
          textAnchor="middle"
        >
          Frame Reach
        </text>

        <text
          x={frame.headTop.x - 15}
          y={frame.bb.y - (frame.bb.y - frame.headTop.y) / 2}
          fontSize="10"
          fill={COCKPIT_COLORS.frame}
          textAnchor="end"
        >
          Stack
        </text>
      </g>
    </svg>
  )
}
