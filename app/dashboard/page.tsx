import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getBikes, upsertUserProfile } from "@/lib/db"
import { signOut } from "@/auth"

export default async function Dashboard() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect('/auth/signin')
  }

  // Check if user ID exists in session
  if (!session.user.id) {
    throw new Error('User ID not found in session. Please sign out and sign in again.')
  }

  // Ensure user profile exists (create on first login)
  await upsertUserProfile(session.user.id, session.user.email)

  // Fetch user's bikes
  const bikes = await getBikes(session.user.id)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold">BikeFit</Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {session.user.email}
            </span>
            <form action={async () => {
              'use server'
              await signOut()
            }}>
              <button
                type="submit"
                className="px-4 py-2 text-sm border border-border rounded-md hover:bg-accent active:scale-[0.98] transition-all"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-4xl font-bold">Your Bikes</h2>
            <Link
              href="/bikes/new"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 active:scale-[0.98] transition-all font-medium"
            >
              Add Bike
            </Link>
          </div>

          {bikes.length === 0 ? (
            /* Empty State */
            <div className="border border-dashed border-border rounded-lg p-12 text-center">
              <div className="mb-6">
                <svg
                  className="mx-auto h-12 w-12 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">No bikes yet</h3>
              <p className="text-muted-foreground mb-6">
                Add your first bike to get personalized cockpit recommendations
              </p>
              <Link
                href="/bikes/new"
                className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 active:scale-[0.98] transition-all font-medium"
              >
                Add Your First Bike
              </Link>
            </div>
          ) : (
            /* Bikes List */
            <div className="grid gap-4">
              {bikes.map((bike) => (
                <Link
                  key={bike.id}
                  href={`/bikes/${bike.id}`}
                  className="p-6 border border-border rounded-lg hover:border-primary hover:shadow-sm active:scale-[0.99] transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">
                        {bike.name || 'Untitled Bike'}
                      </h3>
                      {bike.frames ? (
                        <p className="text-muted-foreground mb-3">
                          {bike.frames.brand} {bike.frames.model} ({bike.frames.size})
                        </p>
                      ) : (
                        <p className="text-muted-foreground mb-3">No frame selected</p>
                      )}
                      <div className="flex gap-6 text-sm">
                        {bike.stem_mm && (
                          <div>
                            <span className="text-muted-foreground">Stem:</span>{' '}
                            <span className="font-medium">{bike.stem_mm}mm</span>
                          </div>
                        )}
                        {bike.spacer_mm !== null && (
                          <div>
                            <span className="text-muted-foreground">Spacers:</span>{' '}
                            <span className="font-medium">{bike.spacer_mm}mm</span>
                          </div>
                        )}
                        {bike.bar_reach_category && (
                          <div>
                            <span className="text-muted-foreground">Bar Reach:</span>{' '}
                            <span className="font-medium capitalize">{bike.bar_reach_category}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <svg
                      className="h-5 w-5 text-muted-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
