"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { slugify } from "@/lib/slugify"
import ConfirmModal from "@/components/admin/ConfirmModal"

interface PostFormData {
  title: string
  slug: string
  description: string
  content: string
  tags: string
  readingTime: string
  published: boolean
}

interface PostInitialData {
  title?: string
  slug?: string
  description?: string
  content?: string
  tags?: string | string[]
  readingTime?: string
  published?: boolean
}

interface PostFormProps {
  id?: string
  initialData?: PostInitialData
}

export default function PostForm({ id, initialData }: PostFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<PostFormData>({
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    description: initialData?.description ?? "",
    content: initialData?.content ?? "",
    tags: Array.isArray(initialData?.tags) ? (initialData.tags as string[]).join(", ") : (initialData?.tags ?? ""),
    readingTime: initialData?.readingTime ?? "",
    published: initialData?.published ?? false,
  })
  const [saving, setSaving] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  function handleTitleChange(title: string) {
    setForm((prev) => ({
      ...prev,
      title,
      slug: prev.slug === slugify(prev.title) || prev.slug === "" ? slugify(title) : prev.slug,
    }))
  }

  async function save(publish?: boolean) {
    setSaving(true)
    const payload = {
      title: form.title,
      slug: form.slug,
      description: form.description,
      content: form.content,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      readingTime: form.readingTime,
      published: publish !== undefined ? publish : form.published,
    }

    const url = id ? `/api/admin/posts/${id}` : "/api/admin/posts"
    const method = id ? "PATCH" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    setSaving(false)
    if (res.ok) {
      router.push("/admin/posts")
      router.refresh()
    }
  }

  async function handleDelete() {
    await fetch(`/api/admin/posts/${id}`, { method: "DELETE" })
    router.push("/admin/posts")
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
            placeholder="Post title"
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1.5">Slug</label>
          <input
            value={form.slug}
            onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
            className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm font-mono text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            placeholder="post-slug"
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1.5">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
            placeholder="Short description for cards and SEO"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1.5">Tags (comma-separated)</label>
            <input
              value={form.tags}
              onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
              className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              placeholder="SaaS, PostgreSQL, Node.js"
            />
            {form.tags && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.tags.split(",").map((t) => t.trim()).filter(Boolean).map((t) => (
                  <span key={t} className="text-xs bg-[var(--bg-card)] border border-[var(--border)] rounded px-2 py-0.5 text-[var(--text-secondary)]">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1.5">Reading Time</label>
            <input
              value={form.readingTime}
              onChange={(e) => setForm((p) => ({ ...p, readingTime: e.target.value }))}
              className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              placeholder="5 min read"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1.5">Content (Markdown)</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
            rows={20}
            className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-y"
            placeholder="Write your post in Markdown..."
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            role="switch"
            aria-checked={form.published}
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
      </div>

      <div className="flex items-center gap-3 mt-8 pt-6 border-t border-[var(--border)]">
        <button
          onClick={() => save(false)}
          disabled={saving}
          className="px-4 py-2 text-sm border border-[var(--border)] text-[var(--text-secondary)] rounded-md hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
        >
          Save Draft
        </button>
        <button
          onClick={() => save(true)}
          disabled={saving}
          className="px-5 py-2 text-sm bg-[var(--accent)] text-[#0A0A0A] rounded-md font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : id ? "Update" : "Publish"}
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

      <ConfirmModal
        isOpen={showDelete}
        label="this post"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  )
}
