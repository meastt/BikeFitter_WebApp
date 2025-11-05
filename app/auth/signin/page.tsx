'use client'

import Link from "next/link"
import { signIn } from "next-auth/react"
import { useState } from "react"

export default function SignIn() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    try {
      setError(null)
      setIsLoading(true)
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch (err) {
      setError('Failed to sign in. Please try again.')
      console.error('Sign in error:', err)
    } finally {
      setIsLoading(false)
    }
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

        {error && (
          <div className="p-4 mb-4 border border-red-200 bg-red-50 text-red-800 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full px-6 py-3 border border-border rounded-md hover:bg-accent active:scale-[0.98] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Continue with Google'}
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
