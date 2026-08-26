"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import ConfirmModal from "@/components/admin/ConfirmModal"
import { readApiError } from "@/lib/client/api-error"

interface ExperienceFormData {
  role: string
  company: string
  period: string
  description: string
  technologies: string
  isCurrent: boolean
  visible: boolean
  order: number
}

interface ExperienceInitialData {
  role?: string
  company?: string
  period?: string
  description?: string
  technologies?: string | string[]
  isCurrent?: boolean
  visible?: boolean
  order?: number
}

interface ExperienceFormProps {
  id?: string
  initialData?: ExperienceInitialData
  nextOrder?: number
}

export default function ExperienceForm({ id, initialData, nextOrder = 0 }: ExperienceFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<ExperienceFormData>({
    role: initialData?.role ?? "",
    company: initialData?.company ?? "",
    period: initialData?.period ?? "",
    description: initialData?.description ?? "",
    technologies: Array.isArray(initialData?.technologies) ? (initialData.technologies as string[]).join(", ") : (initialData?.technologies ?? ""),
    isCurrent: initialData?.isCurrent ?? false,
    visible: initialData?.visible ?? true,
    order: initialData?.order ?? nextOrder,
  })
  const [saving, setSaving] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [error, setError] = useState("")

  async function save() {
    setSaving(true)
    setError("")
    const payload = {
      role: form.role,
      company: form.company,
      period: form.period,
      description: form.description,
      technologies: form.technologies.split(",").map((t) => t.trim()).filter(Boolean),
      isCurrent: form.isCurrent,
      visible: form.visible,
      order: Number(form.order),
    }

    const url = id ? `/api/admin/experience/${id}` : "/api/admin/experience"
    const method = id ? "PATCH" : "POST"

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        setError(await readApiError(res))
        return
      }

      router.push("/admin/experience")
      router.refresh()
    } catch {
      setError("The entry could not be saved. Check your connection and try again.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    await fetch(`/api/admin/experience/${id}`, { method: "DELETE" })
    router.push("/admin/experience")
    router.refresh()
  }

  return (
    <div className="max-w-3xl">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1.5">Role</label>
            <input
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              className="w-full px-3 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              placeholder="Senior Software Engineer"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1.5">Company</label>
            <input
              value={form.company}
              onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
              className="w-full px-3 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              placeholder="Company name"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1.5">Period</label>
            <input
              value={form.period}
              onChange={(e) => setForm((p) => ({ ...p, period: e.target.value }))}
              className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              placeholder="2022 – Present"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1.5">Order</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) }))}
              className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1.5">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
            placeholder="What you built and the impact it had"
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1.5">Technologies (comma-separated, optional)</label>
          <input
            value={form.technologies}
            onChange={(e) => setForm((p) => ({ ...p, technologies: e.target.value }))}
            className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            placeholder="Node.js, PostgreSQL, Redis"
          />
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <button
              role="switch"
              aria-checked={form.isCurrent}
              aria-label="Current role"
              onClick={() => setForm((p) => ({ ...p, isCurrent: !p.isCurrent }))}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                form.isCurrent ? "bg-[var(--accent)]" : "bg-[var(--border)]"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  form.isCurrent ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </button>
            <span className="text-sm text-[var(--text-secondary)]">Current role</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              role="switch"
              aria-checked={form.visible}
              aria-label="Visible on About page"
              onClick={() => setForm((p) => ({ ...p, visible: !p.visible }))}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                form.visible ? "bg-[var(--accent)]" : "bg-[var(--border)]"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  form.visible ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </button>
            <span className="text-sm text-[var(--text-secondary)]">Visible on About page</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-8 pt-6 border-t border-[var(--border)]">
        <button
          onClick={save}
          disabled={saving}
          className="px-5 py-2 text-sm bg-[var(--accent)] text-[#0A0A0A] rounded-md font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : id ? "Update" : "Create"}
        </button>
        {id && (
          <button
            onClick={() => setShowDelete(true)}
            className="ml-auto px-4 py-2 text-sm text-red-400 border border-red-900/40 rounded-md hover:bg-red-900/10 transition-colors"
          >
            Delete
          </button>
        )}
      </div>

      {error && <p role="alert" className="mt-4 text-sm text-red-400">{error}</p>}

      <ConfirmModal
        isOpen={showDelete}
        label="this experience entry"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  )
}
