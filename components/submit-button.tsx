'use client'

import { useFormStatus } from 'react-dom'

type SubmitButtonProps = {
  children?: React.ReactNode
  pendingText?: string
  className?: string
}

export function SubmitButton({
  children = 'Submit',
  pendingText = 'Saving...',
  className = ''
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={`
        px-6 py-3 bg-primary text-primary-foreground rounded-md
        hover:bg-primary/90 active:scale-[0.98] active:bg-primary/80
        transition-all font-medium
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        inline-flex items-center justify-center gap-2
        ${className}
      `}
    >
      {pending && (
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
      )}
      {pending ? pendingText : children}
    </button>
  )
}
