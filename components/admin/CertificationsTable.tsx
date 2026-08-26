"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Pencil, Trash2 } from "lucide-react"
import Badge from "@/components/ui/Badge"
import ConfirmModal from "@/components/admin/ConfirmModal"
import type { Certification } from "@prisma/client"

export default function CertificationsTable({ certifications }: { certifications: Certification[] }) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    await fetch(`/api/admin/certifications/${id}`, { method: "DELETE" })
    setDeleteId(null)
    router.refresh()
  }

  if (certifications.length === 0) {
    return (
      <div className="text-center py-16 text-[var(--text-muted)] text-sm bg-[var(--bg-card)] border border-[var(--border)] rounded-lg">
        No certifications yet.{" "}
        <Link href="/admin/certifications/new" className="text-[var(--accent)] hover:underline">
          Add your first certification →
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
              <th className="text-left px-5 py-3 text-xs text-[var(--text-muted)] font-medium">Name</th>
              <th className="text-left px-5 py-3 text-xs text-[var(--text-muted)] font-medium">Issuer</th>
              <th className="text-left px-5 py-3 text-xs text-[var(--text-muted)] font-medium hidden md:table-cell">Issued</th>
              <th className="text-left px-5 py-3 text-xs text-[var(--text-muted)] font-medium">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {certifications.map((cert) => (
              <tr key={cert.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                <td className="px-5 py-3.5 text-[var(--text-primary)]">{cert.name}</td>
                <td className="px-5 py-3.5 text-[var(--text-secondary)]">{cert.issuer}</td>
                <td className="px-5 py-3.5 text-[var(--text-muted)] hidden md:table-cell">
                  {new Date(cert.issueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="px-5 py-3.5">
                  <Badge variant={cert.visible ? "published" : "draft"} label={cert.visible ? "Visible" : "Hidden"} />
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3 justify-end">
                    <Link
                      href={`/admin/certifications/${cert.id}/edit`}
                      aria-label={`Edit ${cert.name}`}
                      className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <Pencil size={14} />
                    </Link>
                    <button
                      onClick={() => setDeleteId(cert.id)}
                      aria-label={`Delete ${cert.name}`}
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
        label="this certification"
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </>
  )
}
