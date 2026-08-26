"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Pencil, Trash2 } from "lucide-react"
import Badge from "@/components/ui/Badge"
import ConfirmModal from "@/components/admin/ConfirmModal"
import type { Experience } from "@prisma/client"

export default function ExperienceTable({ experience }: { experience: Experience[] }) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    await fetch(`/api/admin/experience/${id}`, { method: "DELETE" })
    setDeleteId(null)
    router.refresh()
  }

  if (experience.length === 0) {
    return (
      <div className="text-center py-16 text-[var(--text-muted)] text-sm bg-[var(--bg-card)] border border-[var(--border)] rounded-lg">
        No experience entries yet.{" "}
        <Link href="/admin/experience/new" className="text-[var(--accent)] hover:underline">
          Add your first entry →
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left px-5 py-3 text-xs text-[var(--text-muted)] font-medium">Role</th>
              <th className="text-left px-5 py-3 text-xs text-[var(--text-muted)] font-medium">Company</th>
              <th className="text-left px-5 py-3 text-xs text-[var(--text-muted)] font-medium hidden md:table-cell">Period</th>
              <th className="text-left px-5 py-3 text-xs text-[var(--text-muted)] font-medium">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {experience.map((item) => (
              <tr key={item.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                <td className="px-5 py-3.5 text-[var(--text-primary)]">{item.role}</td>
                <td className="px-5 py-3.5 text-[var(--text-secondary)]">{item.company}</td>
                <td className="px-5 py-3.5 text-[var(--text-muted)] hidden md:table-cell">{item.period}</td>
                <td className="px-5 py-3.5">
                  <Badge variant={item.visible ? "published" : "draft"} label={item.visible ? "Visible" : "Hidden"} />
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3 justify-end">
                    <Link
                      href={`/admin/experience/${item.id}/edit`}
                      aria-label={`Edit ${item.role}`}
                      className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <Pencil size={14} />
                    </Link>
                    <button
                      onClick={() => setDeleteId(item.id)}
                      aria-label={`Delete ${item.role}`}
                      className="text-[var(--text-muted)] hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        label="this experience entry"
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </>
  )
}
