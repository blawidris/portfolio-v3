"use client"

import { useState } from "react"
import { readApiError } from "@/lib/client/api-error"
import type { Profile } from "@prisma/client"

interface ProfileFormState {
  name: string
  headline: string
  tagline: string
  bio: string
  philosophy: string
  location: string
  availability: string
}

function toFormState(profile: Profile): ProfileFormState {
  return {
    name: profile.name,
    headline: profile.headline,
    tagline: profile.tagline,
    bio: profile.bio,
    philosophy: profile.philosophy.join("\n"),
    location: profile.location,
    availability: profile.availability,
  }
}

export default function ProfileForm({ profile: initialProfile }: { profile: Profile }) {
  const [form, setForm] = useState<ProfileFormState>(toFormState(initialProfile))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function save() {
    setSaving(true)
    setError("")
    setSuccess(false)
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          headline: form.headline,
          tagline: form.tagline,
          bio: form.bio,
          philosophy: form.philosophy.split("\n").map((p) => p.trim()).filter(Boolean),
          location: form.location,
          availability: form.availability,
        }),
      })
      if (!res.ok) {
        setError(await readApiError(res))
        return
      }
      setSuccess(true)
    } catch {
      setError("The profile could not be saved. Check your connection and try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-5">
      <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Profile</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1.5">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1.5">Location</label>
            <input
              value={form.location}
              onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
              className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1.5">Headline (homepage H1)</label>
          <input
            value={form.headline}
            onChange={(e) => setForm((p) => ({ ...p, headline: e.target.value }))}
            className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1.5">Tagline (homepage sub-headline)</label>
          <textarea
            value={form.tagline}
            onChange={(e) => setForm((p) => ({ ...p, tagline: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1.5">Availability badge text</label>
          <input
            value={form.availability}
            onChange={(e) => setForm((p) => ({ ...p, availability: e.target.value }))}
            className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            placeholder="Available for work"
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1.5">Bio (About page, blank line between paragraphs)</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
            rows={8}
            className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-y"
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1.5">Engineering philosophy (one principle per line)</label>
          <textarea
            value={form.philosophy}
            onChange={(e) => setForm((p) => ({ ...p, philosophy: e.target.value }))}
            rows={5}
            className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-y"
          />
        </div>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="mt-5 px-4 py-2 text-sm bg-[var(--accent)] text-[#0A0A0A] rounded-md font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save Profile"}
      </button>
      {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}
      {success && <p className="mt-3 text-sm text-[var(--accent)]">Profile updated.</p>}
    </div>
  )
}
