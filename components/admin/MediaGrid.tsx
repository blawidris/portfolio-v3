"use client"

import { useRef, useState } from "react"
import { Trash2, Upload } from "lucide-react"
import ConfirmModal from "@/components/admin/ConfirmModal"
import { readApiError } from "@/lib/client/api-error"

interface MediaItem {
  id: string
  filename: string
  url: string
}

export default function MediaGrid({ initialMedia, disabled }: { initialMedia: MediaItem[]; disabled: boolean }) {
  const [media, setMedia] = useState(initialMedia)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError("")
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/admin/media", { method: "POST", body: formData })
      if (!res.ok) {
        setError(await readApiError(res))
        return
      }
      const newItem = await res.json()
      setMedia((prev) => [newItem, ...prev])
    } catch {
      setError("The file could not be uploaded. Check your connection and try again.")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function deleteMedia(id: string) {
    await fetch(`/api/admin/media/${id}`, { method: "DELETE" })
    setMedia((prev) => prev.filter((item) => item.id !== id))
    setDeleteId(null)
  }

  return (
    <div>
      <div className="mb-6">
        <label
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md font-medium transition-colors ${
            disabled
              ? "bg-[var(--bg-card)] text-[var(--text-muted)] cursor-not-allowed"
              : "bg-[var(--accent)] text-[#0A0A0A] hover:bg-[var(--accent-hover)] cursor-pointer"
          }`}
        >
          <Upload size={14} />
          {uploading ? "Uploading…" : "Upload image"}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleFileSelected}
            disabled={disabled || uploading}
            className="hidden"
          />
        </label>
        {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}
      </div>

      {media.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">No media uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {media.map((item) => (
            <div key={item.id} className="group relative bg-[var(--bg-card)] border border-[var(--border)] rounded-lg overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element -- external R2 URLs, not optimizable by next/image without a loader config */}
              <img src={item.url} alt={item.filename} className="w-full aspect-square object-cover" />
              <button
                onClick={() => setDeleteId(item.id)}
                aria-label={`Delete ${item.filename}`}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-red-900/80 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
              <p className="px-2 py-1.5 text-xs text-[var(--text-muted)] truncate">{item.filename}</p>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        label="this file"
        onConfirm={() => deleteId && deleteMedia(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
