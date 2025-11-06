import Link from "next/link"
import { ROUTES } from "@/lib/constants"

export function BackButton() {
  return (
    <Link
      href={ROUTES.dashboard}
      className="text-sm text-muted-foreground hover:text-foreground active:scale-[0.98] transition-all inline-flex items-center gap-1 mb-4"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      Back to Dashboard
    </Link>
  )
}
