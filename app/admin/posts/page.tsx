import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Plus } from "lucide-react"
import Badge from "@/components/ui/Badge"
import PostsTable from "@/components/admin/PostsTable"

export default async function AdminPostsPage() {
  let posts: Awaited<ReturnType<typeof prisma.post.findMany>> = []
  try {
    posts = await prisma.post.findMany({ orderBy: { updatedAt: "desc" } })
  } catch {
    // DB not connected
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Posts</h1>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[#0A0A0A] text-sm font-medium rounded-md hover:bg-[var(--accent-hover)] transition-colors"
        >
          <Plus size={15} /> New Post
        </Link>
      </div>

      <PostsTable posts={posts} />
    </div>
  )
}
