import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getPublishedPosts } from "@/lib/content/articles/queries"
import AnimatedSection from "@/components/ui/AnimatedSection"
import SectionHeader from "@/components/ui/SectionHeader"
import PostCard from "@/components/writing/PostCard"

export default async function WritingPreview() {
  const posts = await getPublishedPosts({ take: 2 })

  return (
    <section className="max-w-[1100px] mx-auto px-6 py-20 border-t border-[var(--border)]">
      <AnimatedSection>
        <SectionHeader
          title="Writing"
          subtitle="Thoughts on distributed systems, SaaS architecture, and building software in Africa."
        />
      </AnimatedSection>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {posts.map((post, i) => (
            <AnimatedSection key={post.id} delay={i * 0.07}>
              <PostCard post={post} compact />
            </AnimatedSection>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-6 h-36 animate-pulse"
            />
          ))}
        </div>
      )}

      <AnimatedSection>
        <Link
          href="/writing"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          All articles <ArrowRight size={14} />
        </Link>
      </AnimatedSection>
    </section>
  )
}
