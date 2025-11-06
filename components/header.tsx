import Link from "next/link"
import { APP_NAME, ROUTES } from "@/lib/constants"

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <Link href={ROUTES.dashboard} className="text-2xl font-bold">
          {APP_NAME}
        </Link>
      </div>
    </header>
  )
}
