"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { slugify } from "@/lib/slugify"
import ConfirmModal from "@/components/admin/ConfirmModal"
import { readApiError } from "@/lib/client/api-error"

interface ProjectFormData {
  title: string
  slug: string
  description: string
  content: string
  type: "web" | "mobile"
  status: "live" | "in-progress" | "archived"
  year: number
  stack: string
  featured: boolean
  order: number
}

interface ProjectInitialData {
  title?: string
  slug?: string
  description?: string
  content?: string
  type?: string
  status?: string
  year?: number
  stack?: string | string[]
  featured?: boolean
  order?: number
}

interface ProjectFormProps {
  id?: string
  initialData?: ProjectInitialData
}

export default function ProjectForm({ id, initialData }: ProjectFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<ProjectFormData>({
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    description: initialData?.description ?? "",
    content: initialData?.content ?? "",
    type: (initialData?.type as "web" | "mobile") ?? "web",
    status: (initialData?.status as "live" | "in-progress" | "archived") ?? "live",
    year: initialData?.year ?? new Date().getFullYear(),
    stack: Array.isArray(initialData?.stack) ? (initialData.stack as string[]).join(", ") : (initialData?.stack ?? ""),
    featured: initialData?.featured ?? false,
    order: initialData?.order ?? 0,
  })
  const [saving, setSaving] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [error, setError] = useState("")

  function handleTitleChange(title: string) {
    setForm((prev) => ({
      ...prev,
      title,
      slug: prev.slug === slugify(prev.title) || prev.slug === "" ? slugify(title) : prev.slug,
    }))
  }

  async function save() {
    setSaving(true)
    setError("")
    const payload = {
      title: form.title,
      slug: form.slug,
      description: form.description,
      content: form.content,
      type: form.type,
      status: form.status,
      year: Number(form.year),
      stack: form.stack.split(",").map((t) => t.trim()).filter(Boolean),
      featured: form.featured,
      order: Number(form.order),
    }

    const url = id ? `/api/admin/projects/${id}` : "/api/admin/projects"
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

      router.push("/admin/projects")
      router.refresh()
    } catch {
      setError("The project could not be saved. Check your connection and try again.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    await fetch(`/api/admin/projects/${id}`, { method: "DELETE" })
    router.push("/admin/projects")
    router.refresh()
  }

  return (
    <div className="max-w-3xl">
      <div className="space-y-5">
        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1.5">Title</label>
          <input
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            placeholder="Project title"
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1.5">Slug</label>
          <input
            value={form.slug}
            onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
            className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm font-mono text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            placeholder="project-slug"
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1.5">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
            placeholder="Short description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1.5">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as "web" | "mobile" }))}
              className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            >
              <option value="web">Web</option>
              <option value="mobile">Mobile</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1.5">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as "live" | "in-progress" | "archived" }))}
              className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            >
              <option value="live">Live</option>
              <option value="in-progress">In Progress</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1.5">Year</label>
            <input
              type="number"
              value={form.year}
              onChange={(e) => setForm((p) => ({ ...p, year: Number(e.target.value) }))}
              className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
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
          <label className="block text-xs text-[var(--text-muted)] mb-1.5">Stack (comma-separated)</label>
          <input
            value={form.stack}
            onChange={(e) => setForm((p) => ({ ...p, stack: e.target.value }))}
            className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            placeholder="Next.js, PostgreSQL, Prisma"
          />
          {form.stack && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {form.stack.split(",").map((t) => t.trim()).filter(Boolean).map((t) => (
                <span key={t} className="text-xs bg-[var(--bg-card)] border border-[var(--border)] rounded px-2 py-0.5 text-[var(--text-secondary)]">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            role="switch"
            aria-checked={form.featured}
            aria-label="Featured on homepage"
            onClick={() => setForm((p) => ({ ...p, featured: !p.featured }))}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              form.featured ? "bg-[var(--accent)]" : "bg-[var(--border)]"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                form.featured ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </button>
          <span className="text-sm text-[var(--text-secondary)]">Featured on homepage</span>
        </div>

        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1.5">Content / Case Study (Markdown)</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
            rows={20}
            className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-y"
            placeholder="Write the case study in Markdown..."
          />
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
        label="this project"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  )
}
