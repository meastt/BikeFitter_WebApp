'use client'

import Link from "next/link"
import { signIn } from "next-auth/react"

export default function SignIn() {
  const handleGoogleSignIn = async () => {
    await signIn('google', { callbackUrl: '/dashboard' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to BikeFit</h1>
          <p className="text-muted-foreground">
            Sign in to get your personalized fit recommendations
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            className="w-full px-6 py-3 border border-border rounded-md hover:bg-accent transition-colors font-medium"
          >
            Continue with Google
          </button>

          <button
            disabled
            className="w-full px-6 py-3 border border-border rounded-md bg-muted text-muted-foreground cursor-not-allowed font-medium"
          >
            Continue with Email (Coming Soon)
          </button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          We don't share your data. Ever.
        </p>

        <div className="text-center mt-8">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
