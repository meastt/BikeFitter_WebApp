import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getUserProfile, upsertUserProfile } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { Header } from "@/components/header"
import { BackButton } from "@/components/back-button"
import { ROUTES, PROFILE_DEFAULTS } from "@/lib/constants"

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect(ROUTES.signIn)
  }

  // Fetch current profile
  const profile = await getUserProfile(session.user.id)

  async function handleUpdateProfile(formData: FormData) {
    'use server'

    const session = await auth()
    if (!session?.user?.id) {
      redirect(ROUTES.signIn)
    }

    try {
      const heightCm = formData.get('height_cm') as string
      const inseamCm = formData.get('inseam_cm') as string
      const torsoCm = formData.get('torso_cm') as string
      const armCm = formData.get('arm_cm') as string
      const flexibilityLevel = formData.get('flexibility_level') as string
      const ridingStyle = formData.get('riding_style') as string
      const painPoints = formData.getAll('pain_points') as string[]

      // Parse and validate measurements
      const height = heightCm ? parseInt(heightCm, 10) : undefined
      const inseam = inseamCm ? parseInt(inseamCm, 10) : undefined
      const torso = torsoCm ? parseInt(torsoCm, 10) : undefined
      const arm = armCm ? parseInt(armCm, 10) : undefined
      const flexibility = flexibilityLevel ? parseInt(flexibilityLevel, 10) : undefined

      // Validate ranges
      if (height !== undefined && (isNaN(height) || height < 140 || height > 220)) {
        throw new Error('Height must be between 140cm and 220cm')
      }

      if (inseam !== undefined && (isNaN(inseam) || inseam < 60 || inseam > 110)) {
        throw new Error('Inseam must be between 60cm and 110cm')
      }

      if (torso !== undefined && (isNaN(torso) || torso < 40 || torso > 80)) {
        throw new Error('Torso length must be between 40cm and 80cm')
      }

      if (arm !== undefined && (isNaN(arm) || arm < 50 || arm > 90)) {
        throw new Error('Arm length must be between 50cm and 90cm')
      }

      await upsertUserProfile(session.user.id, session.user.email!, {
        height_cm: height,
        inseam_cm: inseam,
        torso_cm: torso,
        arm_cm: arm,
        flexibility_level: flexibility,
        riding_style: ridingStyle || undefined,
        pain_points: painPoints.length > 0 ? painPoints : undefined,
      })

      revalidatePath(ROUTES.profile)
      revalidatePath(ROUTES.dashboard)
      redirect(ROUTES.dashboard)
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <BackButton />
            <h1 className="text-4xl font-bold">Your Rider Profile</h1>
            <p className="text-muted-foreground mt-2">
              Enter your body measurements to get personalized fit recommendations
            </p>
          </div>

          <form action={handleUpdateProfile} className="space-y-8">
            {/* Body Measurements */}
            <div className="border-b border-border pb-8">
              <h2 className="text-2xl font-semibold mb-4">Body Measurements</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Accurate measurements lead to better fit recommendations
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Height */}
                <div>
                  <label htmlFor="height_cm" className="block text-sm font-medium mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    id="height_cm"
                    name="height_cm"
                    placeholder="175"
                    min="140"
                    max="220"
                    className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    defaultValue={profile?.height_cm || ''}
                  />
                </div>

                {/* Inseam */}
                <div>
                  <label htmlFor="inseam_cm" className="block text-sm font-medium mb-2">
                    Inseam (cm)
                  </label>
                  <input
                    type="number"
                    id="inseam_cm"
                    name="inseam_cm"
                    placeholder="82"
                    min="60"
                    max="110"
                    className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    defaultValue={profile?.inseam_cm || ''}
                  />
                </div>

                {/* Torso */}
                <div>
                  <label htmlFor="torso_cm" className="block text-sm font-medium mb-2">
                    Torso Length (cm)
                  </label>
                  <input
                    type="number"
                    id="torso_cm"
                    name="torso_cm"
                    placeholder="60"
                    min="40"
                    max="80"
                    className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    defaultValue={profile?.torso_cm || ''}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    From hip to shoulder
                  </p>
                </div>

                {/* Arm */}
                <div>
                  <label htmlFor="arm_cm" className="block text-sm font-medium mb-2">
                    Arm Length (cm)
                  </label>
                  <input
                    type="number"
                    id="arm_cm"
                    name="arm_cm"
                    placeholder="65"
                    min="50"
                    max="90"
                    className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    defaultValue={profile?.arm_cm || ''}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    From shoulder to wrist
                  </p>
                </div>
              </div>
            </div>

            {/* Flexibility & Style */}
            <div className="border-b border-border pb-8">
              <h2 className="text-2xl font-semibold mb-4">Riding Preferences</h2>

              <div className="space-y-6">
                {/* Flexibility */}
                <div>
                  <label htmlFor="flexibility_level" className="block text-sm font-medium mb-2">
                    Flexibility Level
                  </label>
                  <select
                    id="flexibility_level"
                    name="flexibility_level"
                    className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    defaultValue={profile?.flexibility_level || ''}
                  >
                    <option value="">— Select your flexibility —</option>
                    <option value="1">Low - I'm not very flexible</option>
                    <option value="2">Medium - Average flexibility</option>
                    <option value="3">High - Very flexible</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Can you touch your toes easily?
                  </p>
                </div>

                {/* Riding Style */}
                <div>
                  <label htmlFor="riding_style" className="block text-sm font-medium mb-2">
                    Riding Style
                  </label>
                  <select
                    id="riding_style"
                    name="riding_style"
                    className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    defaultValue={profile?.riding_style || ''}
                  >
                    <option value="">— Select your style —</option>
                    <option value="comfort">Comfort - Relaxed, upright position</option>
                    <option value="endurance">Endurance - Balanced for long rides</option>
                    <option value="race">Race - Aggressive, aerodynamic</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pain Points */}
            <div className="pb-8">
              <h2 className="text-2xl font-semibold mb-4">Current Pain Points</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Select any areas where you experience discomfort (optional)
              </p>

              <div className="space-y-3">
                {[
                  { value: 'hands', label: 'Hands or wrists' },
                  { value: 'neck', label: 'Neck or shoulders' },
                  { value: 'back', label: 'Lower back' },
                  { value: 'saddle', label: 'Saddle area' },
                ].map((point) => (
                  <label key={point.value} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="pain_points"
                      value={point.value}
                      defaultChecked={profile?.pain_points?.includes(point.value)}
                      className="w-4 h-4 rounded border-border"
                    />
                    <span className="text-sm">{point.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-6 border-t border-border">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 active:scale-[0.98] transition-all font-medium"
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
