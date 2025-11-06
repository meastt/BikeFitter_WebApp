export default function Loading() {
  return (
    <div className="min-h-screen">
      {/* Header skeleton */}
      <div className="border-b border-border h-16 bg-white dark:bg-neutral-900" />

      {/* Main content skeleton */}
      <main className="mx-auto max-w-5xl px-4 md:px-6 py-6 md:py-10">
        <div className="space-y-6">
          {/* Back button + title */}
          <div className="mb-8 space-y-4">
            <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
            <div className="h-10 w-64 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
            <div className="h-6 w-48 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
          </div>

          {/* Frame geometry card skeleton */}
          <div className="rounded-2xl border bg-white dark:bg-neutral-900 shadow-sm p-6">
            <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                  <div className="h-8 w-24 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Cockpit setup card skeleton */}
          <div className="rounded-2xl border bg-white dark:bg-neutral-900 shadow-sm p-6">
            <div className="h-8 w-56 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                  <div className="h-8 w-24 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Visualization card skeleton */}
          <div className="rounded-2xl border bg-white dark:bg-neutral-900 shadow-sm p-6">
            <div className="h-8 w-40 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse mb-4" />
            <div className="w-full aspect-video bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
          </div>
        </div>
      </main>
    </div>
  )
}
