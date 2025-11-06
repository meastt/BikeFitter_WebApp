import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getBike, getUserProfile } from "@/lib/db"
import { Header } from "@/components/header"
import { BackButton } from "@/components/back-button"
import { ROUTES } from "@/lib/constants"
import { calculateFit, getBarReachRange, getDiscomfortLevel } from "@/lib/fit-calculator"
import Link from "next/link"

export default async function BikePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect(ROUTES.signIn)
  }

  // Await params in Next.js 15+
  const { id } = await params

  // Fetch the bike and profile
  const bike = await getBike(id, session.user.id)
  const profile = await getUserProfile(session.user.id)

  if (!bike) {
    redirect(ROUTES.dashboard)
  }

  // Check if profile is complete
  const hasProfile = profile && profile.height_cm && profile.inseam_cm

  // Calculate fit recommendations if profile and frame exist
  let fitRecommendation = null
  if (hasProfile && bike.frames) {
    fitRecommendation = calculateFit(
      {
        height_cm: profile.height_cm,
        inseam_cm: profile.inseam_cm,
        torso_cm: profile.torso_cm || undefined,
        arm_cm: profile.arm_cm || undefined,
        flexibility_level: profile.flexibility_level || undefined,
        riding_style: profile.riding_style || undefined,
        pain_points: profile.pain_points || undefined,
      },
      {
        stack_mm: bike.frames.stack_mm,
        reach_mm: bike.frames.reach_mm,
      },
      {
        stem_mm: bike.stem_mm || undefined,
        spacer_mm: bike.spacer_mm || undefined,
        bar_reach_category: bike.bar_reach_category || undefined,
      }
    )
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

          {/* Fit Recommendations */}
          {fitRecommendation ? (
            <div className="space-y-6">
              {/* Discomfort Score */}
              <div className="p-6 border border-border rounded-lg">
                <h2 className="text-2xl font-semibold mb-4">Fit Analysis</h2>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground mb-1">Overall Fit Score</div>
                    <div className={`text-3xl font-bold ${getDiscomfortLevel(fitRecommendation.discomfort_score).color}`}>
                      {getDiscomfortLevel(fitRecommendation.discomfort_score).label}
                    </div>
                  </div>
                  <div className="text-5xl font-bold text-muted-foreground/20">
                    {100 - fitRecommendation.discomfort_score}
                    <span className="text-2xl">/100</span>
                  </div>
                </div>
                {fitRecommendation.notes.length > 0 && (
                  <div className="mt-4 p-4 bg-muted/50 rounded">
                    <div className="text-sm font-medium mb-2">Personalized Notes:</div>
                    <ul className="text-sm space-y-1">
                      {fitRecommendation.notes.map((note, i) => (
                        <li key={i} className="text-muted-foreground">• {note}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Recommendations */}
              <div className="p-6 border border-border rounded-lg">
                <h2 className="text-2xl font-semibold mb-4">Recommended Cockpit Setup</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Stem Length */}
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Stem Length</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-green-600">{fitRecommendation.ideal_stem_mm}mm</span>
                      {bike.stem_mm && bike.stem_mm !== fitRecommendation.ideal_stem_mm && (
                        <span className="text-sm text-muted-foreground">
                          (currently {bike.stem_mm}mm)
                        </span>
                      )}
                    </div>
                    {bike.stem_mm && bike.stem_mm !== fitRecommendation.ideal_stem_mm && (
                      <div className="mt-2 text-sm">
                        {bike.stem_mm < fitRecommendation.ideal_stem_mm ? (
                          <span className="text-orange-600">
                            ↑ Increase by {fitRecommendation.ideal_stem_mm - bike.stem_mm}mm
                          </span>
                        ) : (
                          <span className="text-blue-600">
                            ↓ Decrease by {bike.stem_mm - fitRecommendation.ideal_stem_mm}mm
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Spacer Stack */}
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Spacer Stack</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-green-600">{fitRecommendation.ideal_spacer_mm}mm</span>
                      {bike.spacer_mm != null && bike.spacer_mm !== fitRecommendation.ideal_spacer_mm && (
                        <span className="text-sm text-muted-foreground">
                          (currently {bike.spacer_mm}mm)
                        </span>
                      )}
                    </div>
                    {bike.spacer_mm != null && bike.spacer_mm !== fitRecommendation.ideal_spacer_mm && (
                      <div className="mt-2 text-sm">
                        {bike.spacer_mm < fitRecommendation.ideal_spacer_mm ? (
                          <span className="text-orange-600">
                            ↑ Add {fitRecommendation.ideal_spacer_mm - bike.spacer_mm}mm spacers
                          </span>
                        ) : (
                          <span className="text-blue-600">
                            ↓ Remove {bike.spacer_mm - fitRecommendation.ideal_spacer_mm}mm spacers
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bar Reach */}
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Bar Reach</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-green-600 capitalize">
                        {fitRecommendation.ideal_bar_reach_category}
                      </span>
                      {bike.bar_reach_category && bike.bar_reach_category !== fitRecommendation.ideal_bar_reach_category && (
                        <span className="text-sm text-muted-foreground">
                          (currently {bike.bar_reach_category})
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {getBarReachRange(fitRecommendation.ideal_bar_reach_category)[0]}–
                      {getBarReachRange(fitRecommendation.ideal_bar_reach_category)[1]}mm
                    </div>
                    {bike.bar_reach_category && bike.bar_reach_category !== fitRecommendation.ideal_bar_reach_category && (
                      <div className="mt-2 text-sm text-orange-600">
                        Consider changing bars
                      </div>
                    )}
                  </div>
                </div>

                {/* Target Stack & Reach */}
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="text-sm text-muted-foreground mb-3">Target Position (Stack & Reach)</div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Target Reach: </span>
                      <span className="font-semibold">{fitRecommendation.target_reach_mm}mm</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Target Stack: </span>
                      <span className="font-semibold">{fitRecommendation.target_stack_mm}mm</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : !hasProfile ? (
            <div className="p-8 border border-dashed border-border rounded-lg text-center">
              <h2 className="text-2xl font-semibold mb-2">Fit Recommendations</h2>
              <p className="text-muted-foreground mb-4">
                Complete your rider profile to get personalized cockpit recommendations
              </p>
              <Link
                href={ROUTES.profile}
                className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 active:scale-[0.98] transition-all font-medium"
              >
                Complete Your Profile
              </Link>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}
