"use client"

import { useState } from "react"
import { readApiError } from "@/lib/client/api-error"

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function submit() {
    setSaving(true)
    setError("")
    setSuccess(false)
    try {
      const res = await fetch("/api/admin/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      if (!res.ok) {
        setError(await readApiError(res))
        return
      }
      setCurrentPassword("")
      setNewPassword("")
      setSuccess(true)
    } catch {
      setError("The password could not be updated. Check your connection and try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-md bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-5">
      <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Change Password</h3>
      <div className="mb-4">
        <label className="block text-xs text-[var(--text-muted)] mb-1.5">Current Password</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
          className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
        />
      </div>
      <div className="mb-4">
        <label className="block text-xs text-[var(--text-muted)] mb-1.5">New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
          minLength={12}
          className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
        />
      </div>
      <button
        onClick={submit}
        disabled={saving || !currentPassword || newPassword.length < 12}
        className="px-4 py-2 text-sm bg-[var(--accent)] text-[#0A0A0A] rounded-md font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
      >
        {saving ? "Updating…" : "Update Password"}
      </button>
      {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}
      {success && <p className="mt-3 text-sm text-[var(--accent)]">Password updated.</p>}
    </div>
  )
}
