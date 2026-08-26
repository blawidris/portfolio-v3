"use client"

import { useEffect } from "react"

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("A page failed to render.", { digest: error.digest })
  }, [error])

  return (
    <section className="max-w-[700px] mx-auto px-6 py-24 text-center">
      <h1 className="font-display text-4xl text-[var(--text-primary)] mb-4">Something went wrong</h1>
      <p className="text-[var(--text-secondary)] mb-8">
        This content is temporarily unavailable. Please try again.
      </p>
      <button
        onClick={reset}
        className="px-5 py-2.5 bg-[var(--accent)] text-[#0A0A0A] text-sm font-medium rounded-md"
      >
        Try again
      </button>
    </section>
  )
}
