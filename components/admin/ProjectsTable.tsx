"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Pencil, Trash2, Star } from "lucide-react"
import Badge from "@/components/ui/Badge"
import ConfirmModal from "@/components/admin/ConfirmModal"
import type { Project } from "@prisma/client"

export default function ProjectsTable({ projects }: { projects: Project[] }) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    await fetch(`/api/admin/projects/${id}`, { method: "DELETE" })
    setDeleteId(null)
    router.refresh()
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-16 text-[var(--text-muted)] text-sm bg-[var(--bg-card)] border border-[var(--border)] rounded-lg">
        No projects yet.{" "}
        <Link href="/admin/projects/new" className="text-[var(--accent)] hover:underline">
          Create your first project →
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
              <th className="text-left px-5 py-3 text-xs text-[var(--text-muted)] font-medium hidden md:table-cell">Type</th>
              <th className="text-left px-5 py-3 text-xs text-[var(--text-muted)] font-medium">Status</th>
              <th className="text-left px-5 py-3 text-xs text-[var(--text-muted)] font-medium hidden lg:table-cell">Featured</th>
              <th className="text-left px-5 py-3 text-xs text-[var(--text-muted)] font-medium hidden lg:table-cell">Order</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                <td className="px-5 py-3.5 text-[var(--text-primary)]">{project.title}</td>
                <td className="px-5 py-3.5 hidden md:table-cell">
                  <Badge variant={project.type as "web" | "mobile"} />
                </td>
                <td className="px-5 py-3.5">
                  <Badge variant={project.status as "live" | "in-progress" | "archived"} />
                </td>
                <td className="px-5 py-3.5 hidden lg:table-cell">
                  {project.featured && <Star size={14} className="text-[var(--accent)]" />}
                </td>
                <td className="px-5 py-3.5 text-[var(--text-muted)] hidden lg:table-cell">{project.order}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3 justify-end">
                    <Link
                      href={`/admin/projects/${project.id}/edit`}
                      className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <Pencil size={14} />
                    </Link>
                    <button
                      onClick={() => setDeleteId(project.id)}
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
        label="this project"
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </>
  )
}
