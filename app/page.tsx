import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">BikeFit</h1>
          <Link
            href="/auth/signin"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4 py-16 text-center max-w-4xl">
          <h2 className="text-5xl font-bold mb-6">
            Get Your Bike Dialed — Instantly.
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Personalized cockpit recommendations based on your body dimensions,
            flexibility, and riding style. No pro fit required.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/auth/signin"
              className="px-8 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-lg font-semibold"
            >
              Get Fit Recommendations
            </Link>
            <button
              className="px-8 py-3 border border-border rounded-md hover:bg-accent transition-colors text-lg font-semibold"
            >
              Compare Bikes
            </button>
          </div>

          {/* Social Proof */}
          <div className="mt-16 grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="p-6 border border-border rounded-lg">
              <p className="text-lg mb-2">"Hands no longer go numb."</p>
              <p className="text-sm text-muted-foreground">— Jacob R.</p>
            </div>
            <div className="p-6 border border-border rounded-lg">
              <p className="text-lg mb-2">"Finally picked the right stem length."</p>
              <p className="text-sm text-muted-foreground">— Alana G.</p>
            </div>
          </div>

          {/* How it works link */}
          <div className="mt-12">
            <button className="text-muted-foreground hover:text-foreground transition-colors underline">
              How does this work?
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>© 2024 BikeFit. Built for cyclists who tinker.</p>
        </div>
      </footer>
    </div>
  )
}
