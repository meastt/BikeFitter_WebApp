'use client'

import { useState } from 'react'
import { BIKE_SPECS, DEFAULT_BIKE_NAME } from '@/lib/constants'
import { SubmitButton } from './SubmitButton'

type Frame = {
  id: string
  brand: string
  model: string
  size: string
  stack_mm: number
  reach_mm: number
  seat_tube_angle_deg?: number | null
  head_tube_length_mm?: number | null
  wheelbase_mm?: number | null
}

export function BikeForm({
  frames,
  action
}: {
  frames: Frame[]
  action: (formData: FormData) => Promise<void>
}) {
  const [geometryMode, setGeometryMode] = useState<'database' | 'manual'>('database')

  return (
    <form action={action} className="space-y-6">
      {/* Bike Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Bike Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          placeholder="e.g., My Gravel Bike, Roubaix, etc."
          className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          defaultValue={DEFAULT_BIKE_NAME}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Give your bike a memorable name
        </p>
      </div>

      {/* Geometry Mode Toggle */}
      <div>
        <label className="block text-sm font-medium mb-3">
          Frame Geometry
        </label>
        <div className="flex gap-4 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="geometry_mode"
              value="database"
              checked={geometryMode === 'database'}
              onChange={(e) => setGeometryMode(e.target.value as 'database' | 'manual')}
              className="w-4 h-4"
            />
            <span className="text-sm">Select from Database</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="geometry_mode"
              value="manual"
              checked={geometryMode === 'manual'}
              onChange={(e) => setGeometryMode(e.target.value as 'database' | 'manual')}
              className="w-4 h-4"
            />
            <span className="text-sm">Enter Manually</span>
          </label>
        </div>

        {/* Database Frame Selection */}
        {geometryMode === 'database' && (
          <>
            <select
              id="frame_id"
              name="frame_id"
              className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">— Select a frame —</option>
              {frames.map((frame) => (
                <option key={frame.id} value={frame.id}>
                  {frame.brand} {frame.model} {frame.size} — Stack: {frame.stack_mm}mm / Reach: {frame.reach_mm}mm
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              Choose your frame from our database
            </p>
          </>
        )}

        {/* Manual Geometry Entry */}
        {geometryMode === 'manual' && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground mb-4">
              Enter your frame's geometry. Find these measurements on your manufacturer's website or bike geometry chart.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Stack - REQUIRED */}
              <div>
                <label htmlFor="manual_stack_mm" className="block text-sm font-medium mb-2">
                  Stack (mm) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="manual_stack_mm"
                  name="manual_stack_mm"
                  required={geometryMode === 'manual'}
                  placeholder="550"
                  min="400"
                  max="700"
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Vertical height from BB to top of head tube
                </p>
              </div>

              {/* Reach - REQUIRED */}
              <div>
                <label htmlFor="manual_reach_mm" className="block text-sm font-medium mb-2">
                  Reach (mm) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="manual_reach_mm"
                  name="manual_reach_mm"
                  required={geometryMode === 'manual'}
                  placeholder="380"
                  min="300"
                  max="500"
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Horizontal distance from BB to top of head tube
                </p>
              </div>

              {/* Seat Tube Angle - Optional */}
              <div>
                <label htmlFor="manual_seat_tube_angle_deg" className="block text-sm font-medium mb-2">
                  Seat Tube Angle (degrees)
                </label>
                <input
                  type="number"
                  id="manual_seat_tube_angle_deg"
                  name="manual_seat_tube_angle_deg"
                  placeholder="73.5"
                  min="70"
                  max="78"
                  step="0.1"
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Optional - affects saddle position
                </p>
              </div>

              {/* Head Tube Length - Optional */}
              <div>
                <label htmlFor="manual_head_tube_length_mm" className="block text-sm font-medium mb-2">
                  Head Tube Length (mm)
                </label>
                <input
                  type="number"
                  id="manual_head_tube_length_mm"
                  name="manual_head_tube_length_mm"
                  placeholder="150"
                  min="80"
                  max="250"
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Optional
                </p>
              </div>

              {/* Wheelbase - Optional */}
              <div>
                <label htmlFor="manual_wheelbase_mm" className="block text-sm font-medium mb-2">
                  Wheelbase (mm)
                </label>
                <input
                  type="number"
                  id="manual_wheelbase_mm"
                  name="manual_wheelbase_mm"
                  placeholder="1020"
                  min="900"
                  max="1200"
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Optional
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
              <p className="text-xs text-blue-900 dark:text-blue-100">
                <strong>Where to find geometry:</strong> Check your bike manufacturer's website under "Geometry" or "Tech Specs".
                Stack and Reach are the most important measurements for bike fit.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Current Cockpit Setup */}
      <div className="border-t border-border pt-6">
        <h3 className="text-lg font-semibold mb-4">Current Cockpit Setup</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Enter your current stem, spacers, and bar setup
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Stem Length */}
          <div>
            <label htmlFor="stem_mm" className="block text-sm font-medium mb-2">
              {BIKE_SPECS.stem.label} ({BIKE_SPECS.stem.unit})
            </label>
            <input
              type="number"
              id="stem_mm"
              name="stem_mm"
              required
              placeholder={String(BIKE_SPECS.stem.default)}
              min={BIKE_SPECS.stem.min}
              max={BIKE_SPECS.stem.max}
              step={BIKE_SPECS.stem.step}
              className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              defaultValue={BIKE_SPECS.stem.default}
            />
          </div>

          {/* Spacer Stack */}
          <div>
            <label htmlFor="spacer_mm" className="block text-sm font-medium mb-2">
              {BIKE_SPECS.spacer.label} ({BIKE_SPECS.spacer.unit})
            </label>
            <input
              type="number"
              id="spacer_mm"
              name="spacer_mm"
              required
              placeholder={String(BIKE_SPECS.spacer.default)}
              min={BIKE_SPECS.spacer.min}
              max={BIKE_SPECS.spacer.max}
              step={BIKE_SPECS.spacer.step}
              className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              defaultValue={BIKE_SPECS.spacer.default}
            />
          </div>

          {/* Bar Reach Category */}
          <div>
            <label htmlFor="bar_reach_category" className="block text-sm font-medium mb-2">
              Bar Reach
            </label>
            <select
              id="bar_reach_category"
              name="bar_reach_category"
              className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value={BIKE_SPECS.barReach.short.value}>{BIKE_SPECS.barReach.short.label}</option>
              <option value={BIKE_SPECS.barReach.med.value}>{BIKE_SPECS.barReach.med.label}</option>
              <option value={BIKE_SPECS.barReach.long.value}>{BIKE_SPECS.barReach.long.label}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <SubmitButton />
    </form>
  )
}
