"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import ConfirmModal from "@/components/admin/ConfirmModal"
import type { FooterLink } from "@prisma/client"

interface FooterLinkFormProps {
  links: FooterLink[]
}

export default function FooterLinkForm({ links: initialLinks }: FooterLinkFormProps) {
  const [links, setLinks] = useState(initialLinks)
  const [form, setForm] = useState({ label: "", url: "", icon: "", order: 0 })
  const [adding, setAdding] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  async function addLink() {
    setAdding(true)
    const res = await fetch("/api/admin/footer-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, order: links.length }),
    })
    if (res.ok) {
      const newLink = await res.json()
      setLinks((prev) => [...prev, newLink])
      setForm({ label: "", url: "", icon: "", order: 0 })
    }
    setAdding(false)
  }

  async function deleteLink(id: string) {
    await fetch(`/api/admin/footer-links/${id}`, { method: "DELETE" })
    setLinks((prev) => prev.filter((l) => l.id !== id))
    setDeleteId(null)
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-medium text-[var(--text-primary)] mb-6">Footer Links</h2>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg divide-y divide-[var(--border)] mb-8">
        {links.length === 0 && (
          <p className="px-5 py-4 text-sm text-[var(--text-muted)]">No footer links yet.</p>
        )}
        {links.map((link) => (
          <div key={link.id} className="flex items-center gap-4 px-5 py-3.5">
            <span className="text-xs text-[var(--text-muted)] font-mono w-16">{link.icon}</span>
            <span className="text-sm text-[var(--text-primary)] flex-1">{link.label}</span>
            <span className="text-xs text-[var(--text-muted)] truncate max-w-[180px]">{link.url}</span>
            <button
              onClick={() => setDeleteId(link.id)}
              className="text-[var(--text-muted)] hover:text-red-400 transition-colors"
              aria-label="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-5">
        <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Add New Link</h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1.5">Label</label>
            <input
              value={form.label}
              onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
              className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              placeholder="GitHub"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1.5">Lucide Icon Name</label>
            <input
              value={form.icon}
              onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
              className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              placeholder="Github"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-xs text-[var(--text-muted)] mb-1.5">URL</label>
          <input
            value={form.url}
            onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
            className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            placeholder="https://github.com/username"
          />
        </div>
        <button
          onClick={addLink}
          disabled={adding || !form.label || !form.url || !form.icon}
          className="px-4 py-2 text-sm bg-[var(--accent)] text-[#0A0A0A] rounded-md font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
        >
          {adding ? "Adding…" : "Add"}
        </button>
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        label="this link"
        onConfirm={() => deleteId && deleteLink(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
