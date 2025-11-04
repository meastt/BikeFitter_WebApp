'use client'

import { useFormStatus } from 'react-dom'
import Link from 'next/link'

export function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <div className="flex gap-4 pt-6">
      <button
        type="submit"
        disabled={pending}
        className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
      >
        {pending ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Saving...
          </>
        ) : (
          'Save Bike'
        )}
      </button>
      <Link
        href="/dashboard"
        className={`px-6 py-3 border border-border rounded-md hover:bg-accent transition-colors font-medium ${
          pending ? 'pointer-events-none opacity-50' : ''
        }`}
      >
        Cancel
      </Link>
    </div>
  )
}
