"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"
import ConfirmModal from "@/components/admin/ConfirmModal"
import { readApiError } from "@/lib/client/api-error"

interface MediaItem {
  id: string
  filename: string
  url: string
}

interface CertificationFormData {
  name: string
  issuer: string
  issueDate: string
  credentialUrl: string
  badgeMediaId: string
  visible: boolean
  order: number
}

interface CertificationInitialData {
  name?: string
  issuer?: string
  issueDate?: string | Date
  credentialUrl?: string | null
  badgeMediaId?: string | null
  visible?: boolean
  order?: number
}

interface CertificationFormProps {
  id?: string
  initialData?: CertificationInitialData
  nextOrder?: number
}

function toDateInputValue(value?: string | Date) {
  if (!value) return ""
  return new Date(value).toISOString().slice(0, 10)
}

export default function CertificationForm({ id, initialData, nextOrder = 0 }: CertificationFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<CertificationFormData>({
    name: initialData?.name ?? "",
    issuer: initialData?.issuer ?? "",
    issueDate: toDateInputValue(initialData?.issueDate),
    credentialUrl: initialData?.credentialUrl ?? "",
    badgeMediaId: initialData?.badgeMediaId ?? "",
    visible: initialData?.visible ?? true,
    order: initialData?.order ?? nextOrder,
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

  async function save() {
    setSaving(true)
    setError("")
    const payload = {
      name: form.name,
      issuer: form.issuer,
      issueDate: form.issueDate,
      credentialUrl: form.credentialUrl || undefined,
      badgeMediaId: form.badgeMediaId || undefined,
      visible: form.visible,
      order: Number(form.order),
    }

    const url = id ? `/api/admin/certifications/${id}` : "/api/admin/certifications"
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

      router.push("/admin/certifications")
      router.refresh()
    } catch {
      setError("The certification could not be saved. Check your connection and try again.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    await fetch(`/api/admin/certifications/${id}`, { method: "DELETE" })
    router.push("/admin/certifications")
    router.refresh()
  }

  return (
    <div className="max-w-3xl">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1.5">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-3 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              placeholder="AWS Certified Solutions Architect"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1.5">Issuer</label>
            <input
              value={form.issuer}
              onChange={(e) => setForm((p) => ({ ...p, issuer: e.target.value }))}
              className="w-full px-3 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              placeholder="Amazon Web Services"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1.5">Issue Date</label>
            <input
              type="date"
              value={form.issueDate}
              onChange={(e) => setForm((p) => ({ ...p, issueDate: e.target.value }))}
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
          <label className="block text-xs text-[var(--text-muted)] mb-1.5">Credential URL (optional)</label>
          <input
            value={form.credentialUrl}
            onChange={(e) => setForm((p) => ({ ...p, credentialUrl: e.target.value }))}
            className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            placeholder="https://www.credly.com/badges/..."
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1.5">Badge Image (optional — upload via Media first)</label>
          {media.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No images uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-6 gap-2">
              {media.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, badgeMediaId: p.badgeMediaId === item.id ? "" : item.id }))}
                  aria-label={`Use ${item.filename} as badge`}
                  className={`relative aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                    form.badgeMediaId === item.id ? "border-[var(--accent)]" : "border-transparent"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- external R2 URLs */}
                  <img src={item.url} alt={item.filename} className="w-full h-full object-cover" />
                  {form.badgeMediaId === item.id && (
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
        label="this certification"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  )
}
