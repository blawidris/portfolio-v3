"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Pencil, Trash2 } from "lucide-react"
import Badge from "@/components/ui/Badge"
import ConfirmModal from "@/components/admin/ConfirmModal"
import type { Post } from "@prisma/client"

export default function PostsTable({ posts }: { posts: Post[] }) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    await fetch(`/api/admin/posts/${id}`, { method: "DELETE" })
    setDeleteId(null)
    router.refresh()
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 text-[var(--text-muted)] text-sm bg-[var(--bg-card)] border border-[var(--border)] rounded-lg">
        No posts yet.{" "}
        <Link href="/admin/posts/new" className="text-[var(--accent)] hover:underline">
          Create your first post →
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
              <th className="text-left px-5 py-3 text-xs text-[var(--text-muted)] font-medium hidden md:table-cell">Date</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                <td className="px-5 py-3.5 text-[var(--text-primary)]">{post.title}</td>
                <td className="px-5 py-3.5">
                  <Badge variant={post.published ? "published" : "draft"} />
                </td>
                <td className="px-5 py-3.5 text-[var(--text-muted)] hidden md:table-cell">
                  {new Date(post.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3 justify-end">
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      aria-label={`Edit ${post.title}`}
                      className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <Pencil size={14} />
                    </Link>
                    <button
                      onClick={() => setDeleteId(post.id)}
                      aria-label={`Delete ${post.title}`}
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
        label="this post"
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </>
  )
}
