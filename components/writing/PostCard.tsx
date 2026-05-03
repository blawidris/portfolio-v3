import Link from "next/link"
import { ArrowRight } from "lucide-react"
import Badge from "@/components/ui/Badge"
import Tag from "@/components/ui/Tag"
import type { Post } from "@prisma/client"

interface PostCardProps {
  post: Post
  compact?: boolean
}

export default function PostCard({ post, compact = false }: PostCardProps) {
  const date = new Date(post.createdAt).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <Link
      href={`/writing/${post.slug}`}
      className="group block bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-6 hover:border-[var(--text-muted)] transition-all duration-200 hover:scale-[1.01]"
    >
      <div className="flex items-start justify-between gap-4 mb-2">
        <h3 className={`font-display text-[var(--text-primary)] leading-snug ${compact ? "text-lg" : "text-xl"}`}>
          {post.title}
        </h3>
        <Badge variant={post.published ? "published" : "draft"} />
      </div>

      <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4">
        {post.description}
      </p>

      {!compact && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {post.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
          <span>{date}</span>
          <span>·</span>
          <span>{post.readingTime}</span>
        </div>
        <span className="inline-flex items-center gap-1 text-xs text-[var(--accent)] group-hover:gap-2 transition-all">
          Read <ArrowRight size={12} />
        </span>
      </div>
    </Link>
  )
}
