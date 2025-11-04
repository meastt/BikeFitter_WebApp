import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function Dashboard() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">BikeFit</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {session.user.email}
            </span>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="px-4 py-2 text-sm border border-border rounded-md hover:bg-accent transition-colors"
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
          <h2 className="text-4xl font-bold mb-4">Your Bikes</h2>
          <p className="text-muted-foreground mb-8">
            Welcome back! You haven't added any bikes yet.
          </p>

          {/* Empty State */}
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
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium">
              Add Your First Bike
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
