import { prisma } from "@/lib/prisma"
import { buildMetadata } from "@/lib/metadata"
import AnimatedSection from "@/components/ui/AnimatedSection"
import SectionHeader from "@/components/ui/SectionHeader"
import PostCard from "@/components/writing/PostCard"

export const metadata = buildMetadata({
  title: "Writing",
  description:
    "Thoughts on distributed systems, SaaS architecture, mobile development, and building software for African markets.",
  path: "/writing",
})

export default async function WritingPage() {
  let posts: Awaited<ReturnType<typeof prisma.post.findMany>> = []
  try {
    posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    })
  } catch {
    // DB not connected
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-16">
      <AnimatedSection>
        <SectionHeader
          title="Writing"
          subtitle="Deep dives on distributed systems, multi-tenant SaaS, and engineering for African markets."
        />
      </AnimatedSection>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post, i) => (
          <AnimatedSection key={post.id} delay={i * 0.05}>
            <PostCard post={post} />
          </AnimatedSection>
        ))}
      </div>

      {posts.length === 0 && (
        <p className="text-[var(--text-muted)] text-sm text-center py-16">
          No articles published yet.
        </p>
      )}
    </div>
  )
}
