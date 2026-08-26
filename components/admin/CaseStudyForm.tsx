"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"
import { slugify } from "@/lib/slugify"
import ConfirmModal from "@/components/admin/ConfirmModal"
import { readApiError } from "@/lib/client/api-error"

interface MediaItem {
  id: string
  filename: string
  url: string
}

interface ProjectOption {
  id: string
  title: string
}

interface CaseStudyFormData {
  title: string
  slug: string
  summary: string
  content: string
  projectId: string
  coverMediaId: string
  published: boolean
  order: number
}

interface CaseStudyInitialData {
  title?: string
  slug?: string
  summary?: string
  content?: string
  projectId?: string | null
  coverMediaId?: string | null
  published?: boolean
  order?: number
}

interface CaseStudyFormProps {
  id?: string
  initialData?: CaseStudyInitialData
  projects: ProjectOption[]
}

export default function CaseStudyForm({ id, initialData, projects }: CaseStudyFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<CaseStudyFormData>({
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    summary: initialData?.summary ?? "",
    content: initialData?.content ?? "",
    projectId: initialData?.projectId ?? "",
    coverMediaId: initialData?.coverMediaId ?? "",
    published: initialData?.published ?? true,
    order: initialData?.order ?? 0,
  })
  const [media, setMedia] = useState<MediaItem[]>([])
  const [saving, setSaving] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/admin/media")
      .then((res) => (res.ok ? res.json() : []))
      .then(setMedia)
      .catch(() => setMedia([]))
  }, [])

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
      summary: form.summary,
      content: form.content,
      projectId: form.projectId || undefined,
      coverMediaId: form.coverMediaId || undefined,
      published: form.published,
      order: Number(form.order),
    }

    const url = id ? `/api/admin/case-studies/${id}` : "/api/admin/case-studies"
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

      router.push("/admin/case-studies")
      router.refresh()
    } catch {
      setError("The case study could not be saved. Check your connection and try again.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    await fetch(`/api/admin/case-studies/${id}`, { method: "DELETE" })
    router.push("/admin/case-studies")
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
            placeholder="Case study title"
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1.5">Slug</label>
          <input
            value={form.slug}
            onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
            className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm font-mono text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            placeholder="case-study-slug"
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1.5">Summary</label>
          <textarea
            value={form.summary}
            onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
            placeholder="Short summary for cards and SEO"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1.5">Linked Project (optional)</label>
            <select
              value={form.projectId}
              onChange={(e) => setForm((p) => ({ ...p, projectId: e.target.value }))}
              className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            >
              <option value="">None — standalone</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.title}</option>
              ))}
            </select>
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
          <label className="block text-xs text-[var(--text-muted)] mb-1.5">Cover Image (optional — upload via Media first)</label>
          {media.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No images uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-6 gap-2">
              {media.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, coverMediaId: p.coverMediaId === item.id ? "" : item.id }))}
                  aria-label={`Use ${item.filename} as cover`}
                  className={`relative aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                    form.coverMediaId === item.id ? "border-[var(--accent)]" : "border-transparent"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- external R2 URLs */}
                  <img src={item.url} alt={item.filename} className="w-full h-full object-cover" />
                  {form.coverMediaId === item.id && (
                    <span className="absolute top-1 right-1 bg-[var(--accent)] text-[#0A0A0A] rounded-full p-0.5">
                      <Check size={10} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            role="switch"
            aria-checked={form.published}
            aria-label="Published"
            onClick={() => setForm((p) => ({ ...p, published: !p.published }))}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              form.published ? "bg-[var(--accent)]" : "bg-[var(--border)]"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                form.published ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </button>
          <span className="text-sm text-[var(--text-secondary)]">
            {form.published ? "Published" : "Draft"}
          </span>
        </div>

        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1.5">Content (Markdown)</label>
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
        label="this case study"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  )
}
