import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getBike, getUserProfile } from "@/lib/db"
import { Header } from "@/components/header"
import { BackButton } from "@/components/back-button"
import { ROUTES } from "@/lib/constants"
import { calculateFitV1 } from "@/lib/fit-adapter"
import { getBarReachValue, getConfidenceLevel, getFlagMessage, type BarCategory, type RidingStyle } from "@/lib/fit-calculator"
import { buildVizInput } from "@/lib/cockpit-viz"
import { CockpitDeltaCard } from "@/components/cockpit-delta-card"
import Link from "next/link"

export default async function BikePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect(ROUTES.signIn)
  }

  // Await params in Next.js 15+
  const { id } = await params

  // Fetch the bike - redirect if not found
  const bikeOrNull = await getBike(id, session.user.id)

  if (!bikeOrNull) {
    redirect(ROUTES.dashboard)
  }

  // Type assertion after redirect check - we know redirect() never returns
  const bike = bikeOrNull

  // Fetch profile separately to avoid TS control flow confusion
  const profile = await getUserProfile(session.user.id)

  // Check if profile is complete
  const hasProfile = profile && profile.height_cm && profile.inseam_cm

  // Determine geometry source (manual overrides frame)
  const hasManualGeometry = bike.manual_stack_mm && bike.manual_reach_mm
  const hasGeometry = hasManualGeometry || bike.frames

  const geometrySource = hasManualGeometry ? {
    stack_mm: bike.manual_stack_mm!,
    reach_mm: bike.manual_reach_mm!,
    seat_tube_angle_deg: bike.manual_seat_tube_angle_deg,
    head_tube_length_mm: bike.manual_head_tube_length_mm,
    wheelbase_mm: bike.manual_wheelbase_mm,
  } : bike.frames ? {
    stack_mm: bike.frames.stack_mm,
    reach_mm: bike.frames.reach_mm,
    seat_tube_angle_deg: bike.frames.seat_tube_angle_deg,
    head_tube_length_mm: bike.frames.head_tube_length_mm,
    wheelbase_mm: bike.frames.wheelbase_mm,
  } : null

  // Calculate fit recommendations if profile and geometry exist
  let fitRecommendation = null
  let usingEstimatedProportions = false

  if (hasProfile && geometrySource && bike.stem_mm && bike.spacer_mm != null && bike.bar_reach_category) {
    // Estimate torso/arm if not provided (using standard proportions)
    const torso_cm = profile.torso_cm || Math.round(profile.height_cm * 0.32)
    const arm_cm = profile.arm_cm || Math.round(profile.height_cm * 0.38)

    // Track if we're using estimates
    usingEstimatedProportions = !profile.torso_cm || !profile.arm_cm

    // Default flexibility and riding style if not set
    const flexibility_level = (profile.flexibility_level || 2) as 1 | 2 | 3
    const riding_style = (profile.riding_style || 'endurance') as RidingStyle
    const pain_points = profile.pain_points || []

    fitRecommendation = calculateFitV1({
      torso_cm,
      arm_cm,
      flexibility_level,
      riding_style,
      pain_points,
      frame_reach_mm: geometrySource.reach_mm,
      stem_mm: bike.stem_mm,
      spacer_mm: bike.spacer_mm,
      bar_reach_category: bike.bar_reach_category as BarCategory
    })
  }

  return (
    <div className="min-h-screen">
      <Header />

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 md:px-6 py-6 md:py-10">
        <div className="space-y-6">
          <div className="mb-8">
            <BackButton />
            <h1 className="text-3xl md:text-4xl font-semibold mb-2">{bike.name || 'Untitled Bike'}</h1>
            {hasManualGeometry ? (
              <p className="text-base md:text-lg text-muted-foreground">Custom Geometry</p>
            ) : bike.frames ? (
              <p className="text-base md:text-lg text-muted-foreground">
                {bike.frames.brand} {bike.frames.model} ({bike.frames.size})
              </p>
            ) : null}
          </div>

          {/* Frame Geometry Section */}
          {geometrySource && (
            <div className="rounded-2xl border bg-white dark:bg-neutral-900 shadow-sm p-6">
              <h2 className="text-xl md:text-2xl font-semibold mb-4">
                Frame Geometry
                {hasManualGeometry && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">(Custom Entry)</span>
                )}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Stack</div>
                  <div className="text-2xl font-bold">{geometrySource.stack_mm}mm</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Reach</div>
                  <div className="text-2xl font-bold">{geometrySource.reach_mm}mm</div>
                </div>
                {geometrySource.seat_tube_angle_deg && (
                  <div>
                    <div className="text-sm text-muted-foreground">Seat Tube Angle</div>
                    <div className="text-2xl font-bold">{geometrySource.seat_tube_angle_deg}°</div>
                  </div>
                )}
                {geometrySource.head_tube_length_mm && (
                  <div>
                    <div className="text-sm text-muted-foreground">Head Tube Length</div>
                    <div className="text-2xl font-bold">{geometrySource.head_tube_length_mm}mm</div>
                  </div>
                )}
                {geometrySource.wheelbase_mm && (
                  <div>
                    <div className="text-sm text-muted-foreground">Wheelbase</div>
                    <div className="text-2xl font-bold">{geometrySource.wheelbase_mm}mm</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Current Cockpit Setup Section */}
          <div className="rounded-2xl border bg-white dark:bg-neutral-900 shadow-sm p-6">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Current Cockpit Setup</h2>
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
              {/* Estimated Proportions Warning */}
              {usingEstimatedProportions && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-amber-600 text-xl">⚠️</span>
                    <div className="flex-1">
                      <div className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                        Using Estimated Body Proportions
                      </div>
                      <p className="text-sm text-amber-700 dark:text-amber-200">
                        We're estimating your torso and/or arm length based on your height. For most accurate fit recommendations,{' '}
                        <Link href={ROUTES.profile} className="underline font-medium hover:text-amber-900">
                          measure and update your profile
                        </Link>
                        . Population-average ratios can vary significantly by individual body type.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Confidence Score & Flags */}
              <div className="rounded-2xl border bg-white dark:bg-neutral-900 shadow-sm p-6">
                <h2 className="text-xl md:text-2xl font-semibold mb-4">Fit Analysis</h2>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground mb-1">Recommendation Confidence</div>
                    <div className={`text-3xl font-bold ${getConfidenceLevel(fitRecommendation.confidence).color}`}>
                      {getConfidenceLevel(fitRecommendation.confidence).label}
                    </div>
                  </div>
                  <div className="text-5xl font-bold text-muted-foreground/20">
                    {fitRecommendation.confidence}
                    <span className="text-2xl">/100</span>
                  </div>
                </div>

                {/* Reach Analysis */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded mb-4">
                  <div>
                    <div className="text-xs text-muted-foreground">Current Reach</div>
                    <div className="text-lg font-semibold">{fitRecommendation.current_effective_reach_mm}mm</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Target Reach</div>
                    <div className="text-lg font-semibold">{fitRecommendation.target_reach_mm}mm</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-muted-foreground">Reach Delta</div>
                    <div className={`text-lg font-semibold ${
                      Math.abs(fitRecommendation.reach_delta_mm) <= 10 ? 'text-green-600' :
                      Math.abs(fitRecommendation.reach_delta_mm) <= 25 ? 'text-yellow-600' :
                      'text-orange-600'
                    }`}>
                      {fitRecommendation.reach_delta_mm > 0 ? '+' : ''}{fitRecommendation.reach_delta_mm}mm
                      {Math.abs(fitRecommendation.reach_delta_mm) <= 10 && ' ✓ Within ideal range'}
                    </div>
                  </div>
                </div>

                {/* Flags */}
                {fitRecommendation.flags.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium mb-2">⚠️ Fit Warnings:</div>
                    <ul className="text-sm space-y-1">
                      {fitRecommendation.flags.map((flag, i) => (
                        <li key={i} className="text-orange-600">• {getFlagMessage(flag)}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Rationale */}
                {fitRecommendation.rationale.length > 0 && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded">
                    <div className="text-sm font-medium mb-2">Why these recommendations:</div>
                    <ul className="text-sm space-y-1">
                      {fitRecommendation.rationale.map((note, i) => (
                        <li key={i} className="text-blue-900 dark:text-blue-100">• {note}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Recommendations */}
              <div className="rounded-2xl border bg-white dark:bg-neutral-900 shadow-sm p-6">
                <h2 className="text-xl md:text-2xl font-semibold mb-4">Recommended Cockpit Setup</h2>
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
                    <div className="mt-1 text-xs text-muted-foreground">
                      Range: {fitRecommendation.ideal_stem_range_mm[0]}–{fitRecommendation.ideal_stem_range_mm[1]}mm
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
                    <div className="mt-1 text-xs text-muted-foreground">
                      Range: {fitRecommendation.ideal_spacer_range_mm[0]}–{fitRecommendation.ideal_spacer_range_mm[1]}mm
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
                        {fitRecommendation.recommended_bar_reach_category}
                      </span>
                      {bike.bar_reach_category && bike.bar_reach_category !== fitRecommendation.recommended_bar_reach_category && (
                        <span className="text-sm text-muted-foreground">
                          (currently {bike.bar_reach_category})
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      ~{getBarReachValue(fitRecommendation.recommended_bar_reach_category)}mm reach
                    </div>
                    {bike.bar_reach_category && bike.bar_reach_category !== fitRecommendation.recommended_bar_reach_category && (
                      <div className="mt-2 text-sm text-orange-600">
                        Consider changing bars
                      </div>
                    )}
                  </div>
                </div>

                {/* Target Drop */}
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="text-sm text-muted-foreground mb-3">Target Bar Position</div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Target Drop: </span>
                      <span className="font-semibold">{fitRecommendation.target_drop_mm}mm below saddle</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Target Reach: </span>
                      <span className="font-semibold">{fitRecommendation.target_reach_mm}mm</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phase 5: Cockpit Delta Visualization */}
              {geometrySource && (
                <div className="mt-8">
                  <CockpitDeltaCard
                    viz={buildVizInput({
                      frameStackMm: geometrySource.stack_mm,
                      frameReachMm: geometrySource.reach_mm,
                      headTubeLengthMm: geometrySource.head_tube_length_mm,
                      currentStemMm: bike.stem_mm!,
                      currentSpacerMm: bike.spacer_mm!,
                      currentBarCategory: bike.bar_reach_category as BarCategory,
                      targetReachMm: fitRecommendation.target_reach_mm,
                      targetDropMm: fitRecommendation.target_drop_mm,
                      idealStemMm: fitRecommendation.ideal_stem_mm,
                      idealSpacerMm: fitRecommendation.ideal_spacer_mm,
                      idealBarCategory: fitRecommendation.recommended_bar_reach_category,
                      idealStemRange: fitRecommendation.ideal_stem_range_mm,
                      idealSpacerRange: fitRecommendation.ideal_spacer_range_mm,
                      reachDelta: fitRecommendation.reach_delta_mm,
                      confidence: fitRecommendation.confidence,
                      flags: fitRecommendation.flags,
                      saddleHeightMm: bike.saddle_height_mm || undefined,
                    })}
                    bikeId={bike.id}
                    currentBarCategory={bike.bar_reach_category as BarCategory}
                  />
                </div>
              )}
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
