"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import ConfirmModal from "@/components/admin/ConfirmModal"
import { readApiError } from "@/lib/client/api-error"
import type { NavigationItem } from "@prisma/client"

export default function NavigationForm({ items: initialItems }: { items: NavigationItem[] }) {
  const [items, setItems] = useState(initialItems)
  const [form, setForm] = useState({ label: "", href: "" })
  const [adding, setAdding] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [error, setError] = useState("")

  async function addItem() {
    setAdding(true)
    setError("")
    try {
      const res = await fetch("/api/admin/navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, order: items.length }),
      })
      if (!res.ok) {
        setError(await readApiError(res))
        return
      }
      const newItem = await res.json()
      setItems((prev) => [...prev, newItem])
      setForm({ label: "", href: "" })
    } catch {
      setError("The nav link could not be saved. Check your connection and try again.")
    } finally {
      setAdding(false)
    }
  }

  async function deleteItem(id: string) {
    await fetch(`/api/admin/navigation/${id}`, { method: "DELETE" })
    setItems((prev) => prev.filter((i) => i.id !== id))
    setDeleteId(null)
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-medium text-[var(--text-primary)] mb-6">Navigation</h2>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg divide-y divide-[var(--border)] mb-8">
        {items.length === 0 && (
          <p className="px-5 py-4 text-sm text-[var(--text-muted)]">No nav links yet.</p>
        )}
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 px-5 py-3.5">
            <span className="text-sm text-[var(--text-primary)] flex-1">{item.label}</span>
            <span className="text-xs text-[var(--text-muted)] font-mono">{item.href}</span>
            <button
              onClick={() => setDeleteId(item.id)}
              className="text-[var(--text-muted)] hover:text-red-400 transition-colors"
              aria-label={`Delete ${item.label}`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-5">
        <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Add Nav Link</h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1.5">Label</label>
            <input
              value={form.label}
              onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
              className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              placeholder="Work"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1.5">Link (starts with /)</label>
            <input
              value={form.href}
              onChange={(e) => setForm((p) => ({ ...p, href: e.target.value }))}
              className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              placeholder="/projects"
            />
          </div>
        </div>
        <button
          onClick={addItem}
          disabled={adding || !form.label || !form.href}
          className="px-4 py-2 text-sm bg-[var(--accent)] text-[#0A0A0A] rounded-md font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
        >
          {adding ? "Adding…" : "Add"}
        </button>
        {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        label="this nav link"
        onConfirm={() => deleteId && deleteItem(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
