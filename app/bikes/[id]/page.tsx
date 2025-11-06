import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getBike } from "@/lib/db"
import { Header } from "@/components/header"
import { BackButton } from "@/components/back-button"
import { ROUTES } from "@/lib/constants"

export default async function BikePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect(ROUTES.signIn)
  }

  // Await params in Next.js 15+
  const { id } = await params

  // Fetch the bike
  const bike = await getBike(id, session.user.id)

  if (!bike) {
    redirect(ROUTES.dashboard)
  }

  return (
    <div className="min-h-screen">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <BackButton />
            <h1 className="text-4xl font-bold mb-2">{bike.name || 'Untitled Bike'}</h1>
            {bike.frames && (
              <p className="text-xl text-muted-foreground">
                {bike.frames.brand} {bike.frames.model} ({bike.frames.size})
              </p>
            )}
          </div>

          {/* Frame Geometry Section */}
          {bike.frames && (
            <div className="mb-8 p-6 border border-border rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">Frame Geometry</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Stack</div>
                  <div className="text-2xl font-bold">{bike.frames.stack_mm}mm</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Reach</div>
                  <div className="text-2xl font-bold">{bike.frames.reach_mm}mm</div>
                </div>
                {bike.frames.seat_tube_angle_deg && (
                  <div>
                    <div className="text-sm text-muted-foreground">Seat Tube Angle</div>
                    <div className="text-2xl font-bold">{bike.frames.seat_tube_angle_deg}°</div>
                  </div>
                )}
                {bike.frames.head_tube_length_mm && (
                  <div>
                    <div className="text-sm text-muted-foreground">Head Tube Length</div>
                    <div className="text-2xl font-bold">{bike.frames.head_tube_length_mm}mm</div>
                  </div>
                )}
                {bike.frames.wheelbase_mm && (
                  <div>
                    <div className="text-sm text-muted-foreground">Wheelbase</div>
                    <div className="text-2xl font-bold">{bike.frames.wheelbase_mm}mm</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Current Cockpit Setup Section */}
          <div className="mb-8 p-6 border border-border rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Current Cockpit Setup</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {bike.stem_mm && (
                <div>
                  <div className="text-sm text-muted-foreground">Stem Length</div>
                  <div className="text-2xl font-bold">{bike.stem_mm}mm</div>
                </div>
              )}
              {bike.spacer_mm != null && (
                <div>
                  <div className="text-sm text-muted-foreground">Spacer Stack</div>
                  <div className="text-2xl font-bold">{bike.spacer_mm}mm</div>
                </div>
              )}
              {bike.bar_reach_category && (
                <div>
                  <div className="text-sm text-muted-foreground">Bar Reach</div>
                  <div className="text-2xl font-bold capitalize">{bike.bar_reach_category}</div>
                </div>
              )}
              {bike.saddle_height_mm && (
                <div>
                  <div className="text-sm text-muted-foreground">Saddle Height</div>
                  <div className="text-2xl font-bold">{bike.saddle_height_mm}mm</div>
                </div>
              )}
              {bike.saddle_setback_mm && (
                <div>
                  <div className="text-sm text-muted-foreground">Saddle Setback</div>
                  <div className="text-2xl font-bold">{bike.saddle_setback_mm}mm</div>
                </div>
              )}
            </div>
          </div>

          {/* Fit Recommendations - Placeholder for Phase 3 */}
          <div className="p-8 border border-dashed border-border rounded-lg text-center">
            <h2 className="text-2xl font-semibold mb-2">Fit Recommendations</h2>
            <p className="text-muted-foreground">
              Personalized cockpit recommendations coming soon
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
