import { notFound } from "next/navigation"
import { getPublishedPostBySlug } from "@/lib/content/articles/queries"
import { parseMarkdown } from "@/lib/markdown"
import { buildMetadata } from "@/lib/metadata"
import Tag from "@/components/ui/Tag"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPublishedPostBySlug(slug)
  if (!post) return {}
  return buildMetadata({ title: post.title, description: post.description, path: `/writing/${slug}` })
}

export default async function PostDetailPage({ params }: Props) {
  const { slug } = await params
  const post = await getPublishedPostBySlug(slug)
  if (!post) notFound()

  const contentHtml = parseMarkdown(post.content)
  const date = new Date(post.createdAt).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <article className="max-w-[700px] mx-auto px-6 py-16">
      <header className="mb-10">
        <h1 className="font-display text-4xl md:text-5xl text-[var(--text-primary)] leading-tight mb-4">
          {post.title}
        </h1>
        <div className="flex items-center gap-3 text-sm text-[var(--text-muted)] mb-5">
          <span>{date}</span>
          <span>·</span>
          <span>{post.readingTime}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
      </header>

      <div
        className="prose prose-invert max-w-none prose-headings:font-display prose-a:text-[var(--accent)] prose-a:no-underline hover:prose-a:underline"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </article>
  )
}
