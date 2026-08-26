"use client"

import { useRef, useState } from "react"
import { Star, Trash2, Upload } from "lucide-react"
import ConfirmModal from "@/components/admin/ConfirmModal"
import { readApiError } from "@/lib/client/api-error"
import type { Media, Resume } from "@prisma/client"

type ResumeWithMedia = Resume & { media: Media }

export default function ResumeUploadForm({ resumes: initialResumes }: { resumes: ResumeWithMedia[] }) {
  const [resumes, setResumes] = useState(initialResumes)
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
      const res = await fetch("/api/admin/resume", { method: "POST", body: formData })
      if (!res.ok) {
        setError(await readApiError(res))
        return
      }
      const newResume = await res.json()
      setResumes((prev) => [newResume, ...prev.map((r) => ({ ...r, isActive: false }))])
    } catch {
      setError("The resume could not be uploaded. Check your connection and try again.")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function activate(id: string) {
    const res = await fetch(`/api/admin/resume/${id}`, { method: "PATCH" })
    if (!res.ok) return
    setResumes((prev) => prev.map((r) => ({ ...r, isActive: r.id === id })))
  }

  async function deleteResume(id: string) {
    await fetch(`/api/admin/resume/${id}`, { method: "DELETE" })
    setResumes((prev) => prev.filter((r) => r.id !== id))
    setDeleteId(null)
  }

  return (
    <div className="max-w-2xl bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-5">
      <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Resume</h3>

      {resumes.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)] mb-4">No resume uploaded yet. The About page won&apos;t show a download link until one is active.</p>
      ) : (
        <div className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-lg mb-4">
          {resumes.map((resume) => (
            <div key={resume.id} className="flex items-center gap-3 px-4 py-3">
              <span className="text-sm text-[var(--text-primary)] flex-1 truncate">{resume.publicFilename}</span>
              {resume.isActive ? (
                <span className="text-xs text-[var(--accent)] flex items-center gap-1">
                  <Star size={12} fill="currentColor" /> Active
                </span>
              ) : (
                <button
                  onClick={() => activate(resume.id)}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Set active
                </button>
              )}
              <button
                onClick={() => setDeleteId(resume.id)}
                aria-label={`Delete ${resume.publicFilename}`}
                className="text-[var(--text-muted)] hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <label className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] rounded-md hover:text-[var(--text-primary)] transition-colors cursor-pointer">
        <Upload size={14} />
        {uploading ? "Uploading…" : "Upload PDF"}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileSelected}
          disabled={uploading}
          className="hidden"
        />
      </label>
      {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}

      <ConfirmModal
        isOpen={!!deleteId}
        label="this resume"
        onConfirm={() => deleteId && deleteResume(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
