"use client"

import { useState } from "react"
import Link from "next/link"
import { readApiError } from "@/lib/client/api-error"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/admin/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        setError(await readApiError(res))
        return
      }
      setSubmitted(true)
    } catch {
      setError("The request could not be completed. Check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4">
      <div className="w-full max-w-sm">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-8">
          <div className="mb-8">
            <span className="font-mono text-[var(--accent)] font-bold text-xl">IL</span>
            <h1 className="text-[var(--text-primary)] text-xl font-medium mt-2">Reset password</h1>
            <p className="text-[var(--text-muted)] text-sm mt-1">
              Enter your admin email and we&apos;ll send a reset link if it matches an account.
            </p>
          </div>

          {submitted ? (
            <p className="text-sm text-[var(--text-secondary)]">
              If that email is registered, a reset link has been sent. Check your inbox.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              {error && (
                <p className="text-red-400 text-xs bg-red-900/20 border border-red-900/40 rounded-md px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[var(--accent)] text-[#0A0A0A] text-sm font-medium rounded-md hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-[var(--text-muted)] mt-6">
            <Link href="/admin/login" className="text-[var(--accent)] hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
