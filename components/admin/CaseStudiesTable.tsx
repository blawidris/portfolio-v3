"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Pencil, Trash2 } from "lucide-react"
import Badge from "@/components/ui/Badge"
import ConfirmModal from "@/components/admin/ConfirmModal"
import type { CaseStudy } from "@prisma/client"

export default function CaseStudiesTable({ caseStudies }: { caseStudies: CaseStudy[] }) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    await fetch(`/api/admin/case-studies/${id}`, { method: "DELETE" })
    setDeleteId(null)
    router.refresh()
  }

  if (caseStudies.length === 0) {
    return (
      <div className="text-center py-16 text-[var(--text-muted)] text-sm bg-[var(--bg-card)] border border-[var(--border)] rounded-lg">
        No case studies yet.{" "}
        <Link href="/admin/case-studies/new" className="text-[var(--accent)] hover:underline">
          Create your first case study →
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
              <th className="text-left px-5 py-3 text-xs text-[var(--text-muted)] font-medium">Title</th>
              <th className="text-left px-5 py-3 text-xs text-[var(--text-muted)] font-medium">Status</th>
              <th className="text-left px-5 py-3 text-xs text-[var(--text-muted)] font-medium hidden lg:table-cell">Order</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {caseStudies.map((caseStudy) => (
              <tr key={caseStudy.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                <td className="px-5 py-3.5 text-[var(--text-primary)]">{caseStudy.title}</td>
                <td className="px-5 py-3.5">
                  <Badge variant={caseStudy.published ? "published" : "draft"} />
                </td>
                <td className="px-5 py-3.5 text-[var(--text-muted)] hidden lg:table-cell">{caseStudy.order}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3 justify-end">
                    <Link
                      href={`/admin/case-studies/${caseStudy.id}/edit`}
                      aria-label={`Edit ${caseStudy.title}`}
                      className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <Pencil size={14} />
                    </Link>
                    <button
                      onClick={() => setDeleteId(caseStudy.id)}
                      aria-label={`Delete ${caseStudy.title}`}
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
        label="this case study"
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </>
  )
}
