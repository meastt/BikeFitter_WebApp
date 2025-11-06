import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { listFrames, createBike } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { SubmitButton } from "./SubmitButton"
import { Header } from "@/components/header"
import { BackButton } from "@/components/back-button"
import { BIKE_SPECS, DEFAULT_BIKE_NAME, ROUTES } from "@/lib/constants"

export default async function NewBikePage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect(ROUTES.signIn)
  }

  // Fetch available frames
  const frames = await listFrames()

  async function handleCreateBike(formData: FormData) {
    'use server'

    const session = await auth()
    if (!session?.user?.id) {
      redirect(ROUTES.signIn)
    }

    try {
      const name = formData.get('name') as string
      const frameId = formData.get('frame_id') as string
      const stemMm = formData.get('stem_mm') as string
      const spacerMm = formData.get('spacer_mm') as string
      const barReachCategory = formData.get('bar_reach_category') as 'short' | 'med' | 'long'

      // Validate required fields
      if (!name || name.trim() === '') {
        throw new Error('Bike name is required')
      }

      // Parse and validate numbers
      const stemValue = stemMm ? parseInt(stemMm, 10) : undefined
      const spacerValue = spacerMm ? parseInt(spacerMm, 10) : undefined

      if (stemValue !== undefined && (isNaN(stemValue) || stemValue < BIKE_SPECS.stem.min || stemValue > BIKE_SPECS.stem.max)) {
        throw new Error(`Stem length must be between ${BIKE_SPECS.stem.min}mm and ${BIKE_SPECS.stem.max}mm`)
      }

      if (spacerValue !== undefined && (isNaN(spacerValue) || spacerValue < BIKE_SPECS.spacer.min || spacerValue > BIKE_SPECS.spacer.max)) {
        throw new Error(`Spacer stack must be between ${BIKE_SPECS.spacer.min}mm and ${BIKE_SPECS.spacer.max}mm`)
      }

      await createBike(session.user.id, {
        name: name.trim(),
        frame_id: frameId || undefined,
        stem_mm: stemValue,
        spacer_mm: spacerValue,
        bar_reach_category: barReachCategory || undefined,
      })

      revalidatePath(ROUTES.dashboard)
      redirect(ROUTES.dashboard)
    } catch (error) {
      console.error('Error creating bike:', error)
      throw error
    }
  }

  return (
    <div className="min-h-screen">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <BackButton />
            <h1 className="text-4xl font-bold">Add a Bike</h1>
            <p className="text-muted-foreground mt-2">
              Enter your bike's details to get personalized fit recommendations
            </p>
          </div>

          <form action={handleCreateBike} className="space-y-6">
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

            {/* Frame Selection */}
            <div>
              <label htmlFor="frame_id" className="block text-sm font-medium mb-2">
                Frame Geometry
              </label>
              <select
                id="frame_id"
                name="frame_id"
                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">— Select a frame (or enter manually later) —</option>
                {frames.map((frame) => (
                  <option key={frame.id} value={frame.id}>
                    {frame.brand} {frame.model} {frame.size} — Stack: {frame.stack_mm}mm / Reach: {frame.reach_mm}mm
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Don't see your frame? You can enter geometry manually later
              </p>
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
        </div>
      </main>
    </div>
  )
}
