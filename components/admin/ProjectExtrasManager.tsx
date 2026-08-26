"use client"

import { useEffect, useState } from "react"
import { Trash2 } from "lucide-react"
import ConfirmModal from "@/components/admin/ConfirmModal"
import { readApiError } from "@/lib/client/api-error"
import type { Media, ProjectChallenge, ProjectImage, ProjectMetric } from "@prisma/client"

interface MediaItem {
  id: string
  filename: string
  url: string
}

type ImageWithMedia = ProjectImage & { media: Media }

interface ProjectExtrasManagerProps {
  projectId: string
  projectSlug: string
  images: ImageWithMedia[]
  challenges: ProjectChallenge[]
  metrics: ProjectMetric[]
  previewToken: string | null
  siteUrl: string
}

export default function ProjectExtrasManager({ projectId, projectSlug, images: initialImages, challenges: initialChallenges, metrics: initialMetrics, previewToken: initialToken, siteUrl }: ProjectExtrasManagerProps) {
  const [images, setImages] = useState(initialImages)
  const [challenges, setChallenges] = useState(initialChallenges)
  const [metrics, setMetrics] = useState(initialMetrics)
  const [previewToken, setPreviewToken] = useState(initialToken)
  const [media, setMedia] = useState<MediaItem[]>([])
  const [error, setError] = useState("")

  const [newImageMediaId, setNewImageMediaId] = useState("")
  const [newImageRole, setNewImageRole] = useState<"gallery" | "diagram">("gallery")
  const [newImageCaption, setNewImageCaption] = useState("")
  const [addingImage, setAddingImage] = useState(false)

  const [newChallenge, setNewChallenge] = useState({ title: "", description: "" })
  const [addingChallenge, setAddingChallenge] = useState(false)

  const [newMetric, setNewMetric] = useState({ label: "", value: "", context: "" })
  const [addingMetric, setAddingMetric] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<{ kind: "image" | "challenge" | "metric"; id: string } | null>(null)
  const [regenerating, setRegenerating] = useState(false)

  useEffect(() => {
    fetch("/api/admin/media")
      .then((res) => (res.ok ? res.json() : []))
      .then(setMedia)
      .catch(() => setMedia([]))
  }, [])

  async function addImage() {
    if (!newImageMediaId) return
    setAddingImage(true)
    setError("")
    try {
      const res = await fetch("/api/admin/project-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, mediaId: newImageMediaId, role: newImageRole, caption: newImageCaption || undefined, order: images.length }),
      })
      if (!res.ok) {
        setError(await readApiError(res))
        return
      }
      const image = await res.json()
      setImages((prev) => [...prev, image])
      setNewImageMediaId("")
      setNewImageCaption("")
    } catch {
      setError("The image could not be attached. Check your connection and try again.")
    } finally {
      setAddingImage(false)
    }
  }

  async function addChallenge() {
    if (!newChallenge.title.trim() || !newChallenge.description.trim()) return
    setAddingChallenge(true)
    setError("")
    try {
      const res = await fetch("/api/admin/project-challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, ...newChallenge, order: challenges.length }),
      })
      if (!res.ok) {
        setError(await readApiError(res))
        return
      }
      const challenge = await res.json()
      setChallenges((prev) => [...prev, challenge])
      setNewChallenge({ title: "", description: "" })
    } catch {
      setError("The challenge could not be saved. Check your connection and try again.")
    } finally {
      setAddingChallenge(false)
    }
  }

  async function addMetric() {
    if (!newMetric.label.trim() || !newMetric.value.trim()) return
    setAddingMetric(true)
    setError("")
    try {
      const res = await fetch("/api/admin/project-metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, label: newMetric.label, value: newMetric.value, context: newMetric.context || undefined, order: metrics.length }),
      })
      if (!res.ok) {
        setError(await readApiError(res))
        return
      }
      const metric = await res.json()
      setMetrics((prev) => [...prev, metric])
      setNewMetric({ label: "", value: "", context: "" })
    } catch {
      setError("The metric could not be saved. Check your connection and try again.")
    } finally {
      setAddingMetric(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    const paths = { image: "project-images", challenge: "project-challenges", metric: "project-metrics" }
    await fetch(`/api/admin/${paths[deleteTarget.kind]}/${deleteTarget.id}`, { method: "DELETE" })
    if (deleteTarget.kind === "image") setImages((prev) => prev.filter((i) => i.id !== deleteTarget.id))
    if (deleteTarget.kind === "challenge") setChallenges((prev) => prev.filter((c) => c.id !== deleteTarget.id))
    if (deleteTarget.kind === "metric") setMetrics((prev) => prev.filter((m) => m.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  async function regeneratePreviewToken() {
    setRegenerating(true)
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/preview-token`, { method: "POST" })
      if (res.ok) {
        const { previewToken: token } = await res.json()
        setPreviewToken(token)
      }
    } finally {
      setRegenerating(false)
    }
  }

  const previewUrl = previewToken ? `${siteUrl}/projects/${projectSlug}?preview=${previewToken}` : null

  function imageUrl(image: ImageWithMedia) {
    return media.find((item) => item.id === image.mediaId)?.url
  }

  return (
    <div className="space-y-8">
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-5">
        <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Gallery &amp; Diagrams</h3>
        {images.length > 0 && (
          <div className="grid grid-cols-4 gap-3 mb-4">
            {images.map((image) => {
              const url = imageUrl(image)
              return (
                <div key={image.id} className="relative aspect-square rounded-md overflow-hidden group bg-[var(--bg-secondary)]">
                  {url && (
                    // eslint-disable-next-line @next/next/no-img-element -- external R2 URLs
                    <img src={url} alt={image.caption ?? image.media.filename} className="w-full h-full object-cover" />
                  )}
                  <button
                    onClick={() => setDeleteTarget({ kind: "image", id: image.id })}
                    aria-label={`Remove ${image.media.filename}`}
                    className="absolute top-1 right-1 p-1 rounded-md bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-red-900/80 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                  <span className="absolute bottom-1 left-1 text-[10px] px-1.5 py-0.5 rounded bg-black/60 text-white capitalize">{image.role}</span>
                </div>
              )
            })}
          </div>
        )}
        {media.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">Upload images via the Media library first.</p>
        ) : (
          <div className="space-y-2">
            <select
              value={newImageMediaId}
              onChange={(e) => setNewImageMediaId(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            >
              <option value="">Select an image…</option>
              {media.map((item) => (
                <option key={item.id} value={item.id}>{item.filename}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <select
                value={newImageRole}
                onChange={(e) => setNewImageRole(e.target.value as "gallery" | "diagram")}
                className="px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              >
                <option value="gallery">Gallery</option>
                <option value="diagram">Diagram</option>
              </select>
              <input
                value={newImageCaption}
                onChange={(e) => setNewImageCaption(e.target.value)}
                placeholder="Caption (optional)"
                className="flex-1 px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
              <button
                onClick={addImage}
                disabled={addingImage || !newImageMediaId}
                className="px-4 py-2 text-sm bg-[var(--accent)] text-[#0A0A0A] rounded-md font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-5">
        <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Challenges</h3>
        <div className="space-y-3 mb-4">
          {challenges.map((challenge) => (
            <div key={challenge.id} className="flex items-start justify-between gap-3 px-3 py-2 bg-[var(--bg-secondary)] rounded-md">
              <div>
                <p className="text-sm text-[var(--text-primary)] font-medium">{challenge.title}</p>
                <p className="text-xs text-[var(--text-muted)]">{challenge.description}</p>
              </div>
              <button
                onClick={() => setDeleteTarget({ kind: "challenge", id: challenge.id })}
                aria-label={`Delete ${challenge.title}`}
                className="text-[var(--text-muted)] hover:text-red-400 transition-colors shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {challenges.length === 0 && <p className="text-sm text-[var(--text-muted)]">No challenges added yet.</p>}
        </div>
        <div className="space-y-2">
          <input
            value={newChallenge.title}
            onChange={(e) => setNewChallenge((p) => ({ ...p, title: e.target.value }))}
            placeholder="Challenge title"
            className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
          <textarea
            value={newChallenge.description}
            onChange={(e) => setNewChallenge((p) => ({ ...p, description: e.target.value }))}
            placeholder="How it was solved"
            rows={2}
            className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
          />
          <button
            onClick={addChallenge}
            disabled={addingChallenge || !newChallenge.title.trim() || !newChallenge.description.trim()}
            className="px-4 py-2 text-sm bg-[var(--accent)] text-[#0A0A0A] rounded-md font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
          >
            Add Challenge
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-5">
        <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Metrics</h3>
        <div className="space-y-2 mb-4">
          {metrics.map((metric) => (
            <div key={metric.id} className="flex items-center justify-between gap-3 px-3 py-2 bg-[var(--bg-secondary)] rounded-md">
              <span className="text-sm text-[var(--text-primary)]">
                <strong>{metric.value}</strong> — {metric.label}
                {metric.context && <span className="text-[var(--text-muted)]"> ({metric.context})</span>}
              </span>
              <button
                onClick={() => setDeleteTarget({ kind: "metric", id: metric.id })}
                aria-label={`Delete ${metric.label}`}
                className="text-[var(--text-muted)] hover:text-red-400 transition-colors shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {metrics.length === 0 && <p className="text-sm text-[var(--text-muted)]">No metrics added yet.</p>}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <input
            value={newMetric.label}
            onChange={(e) => setNewMetric((p) => ({ ...p, label: e.target.value }))}
            placeholder="Label"
            className="px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
          <input
            value={newMetric.value}
            onChange={(e) => setNewMetric((p) => ({ ...p, value: e.target.value }))}
            placeholder="Value"
            className="px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
          <input
            value={newMetric.context}
            onChange={(e) => setNewMetric((p) => ({ ...p, context: e.target.value }))}
            placeholder="Context (optional)"
            className="px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>
        <button
          onClick={addMetric}
          disabled={addingMetric || !newMetric.label.trim() || !newMetric.value.trim()}
          className="mt-2 px-4 py-2 text-sm bg-[var(--accent)] text-[#0A0A0A] rounded-md font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
        >
          Add Metric
        </button>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-5">
        <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Preview Link</h3>
        <p className="text-xs text-[var(--text-muted)] mb-3">
          Share this link to let someone view the project before it&apos;s published. Regenerating invalidates the old link.
        </p>
        {previewToken && previewUrl ? (
          <p className="text-xs font-mono text-[var(--text-secondary)] break-all mb-3">{previewUrl}</p>
        ) : (
          <p className="text-sm text-[var(--text-muted)] mb-3">No preview link generated yet.</p>
        )}
        <button
          onClick={regeneratePreviewToken}
          disabled={regenerating}
          className="px-4 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] rounded-md hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
        >
          {regenerating ? "Generating…" : previewToken ? "Regenerate Link" : "Generate Link"}
        </button>
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        label={deleteTarget?.kind === "image" ? "this image" : deleteTarget?.kind === "challenge" ? "this challenge" : "this metric"}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
