import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { listFrames, createBike } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { Header } from "@/components/header"
import { BackButton } from "@/components/back-button"
import { BIKE_SPECS, ROUTES } from "@/lib/constants"
import { BikeForm } from "./BikeForm"

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
      const geometryMode = formData.get('geometry_mode') as string
      const frameId = formData.get('frame_id') as string
      const stemMm = formData.get('stem_mm') as string
      const spacerMm = formData.get('spacer_mm') as string
      const barReachCategory = formData.get('bar_reach_category') as 'short' | 'med' | 'long'

      // Manual geometry fields
      const manualStackMm = formData.get('manual_stack_mm') as string
      const manualReachMm = formData.get('manual_reach_mm') as string
      const manualSeatTubeAngle = formData.get('manual_seat_tube_angle_deg') as string
      const manualHeadTubeLength = formData.get('manual_head_tube_length_mm') as string
      const manualWheelbase = formData.get('manual_wheelbase_mm') as string

      // Validate required fields
      if (!name || name.trim() === '') {
        throw new Error('Bike name is required')
      }

      // Validate geometry mode requirements
      if (geometryMode === 'manual') {
        if (!manualStackMm || !manualReachMm) {
          throw new Error('Stack and Reach are required for manual geometry entry')
        }
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

      // Parse manual geometry
      const manualStack = manualStackMm ? parseInt(manualStackMm, 10) : undefined
      const manualReach = manualReachMm ? parseInt(manualReachMm, 10) : undefined
      const manualSeatAngle = manualSeatTubeAngle ? parseFloat(manualSeatTubeAngle) : undefined
      const manualHeadTube = manualHeadTubeLength ? parseInt(manualHeadTubeLength, 10) : undefined
      const manualWheelbaseValue = manualWheelbase ? parseInt(manualWheelbase, 10) : undefined

      // Validate manual geometry ranges
      if (manualStack !== undefined && (isNaN(manualStack) || manualStack < 400 || manualStack > 700)) {
        throw new Error('Stack must be between 400mm and 700mm')
      }

      if (manualReach !== undefined && (isNaN(manualReach) || manualReach < 300 || manualReach > 500)) {
        throw new Error('Reach must be between 300mm and 500mm')
      }

      await createBike(session.user.id, {
        name: name.trim(),
        frame_id: geometryMode === 'database' && frameId ? frameId : undefined,
        stem_mm: stemValue,
        spacer_mm: spacerValue,
        bar_reach_category: barReachCategory || undefined,
        manual_stack_mm: manualStack,
        manual_reach_mm: manualReach,
        manual_seat_tube_angle_deg: manualSeatAngle,
        manual_head_tube_length_mm: manualHeadTube,
        manual_wheelbase_mm: manualWheelbaseValue,
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

          <BikeForm frames={frames} action={handleCreateBike} />
        </div>
      </main>
    </div>
  )
}
