import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { prisma } from "@/lib/prisma"
import AnimatedSection from "@/components/ui/AnimatedSection"
import SectionHeader from "@/components/ui/SectionHeader"
import ProjectCard from "@/components/projects/ProjectCard"

export default async function SelectedWork() {
  let projects: Awaited<ReturnType<typeof prisma.project.findMany>> = []
  try {
    projects = await prisma.project.findMany({
      where: { featured: true },
      orderBy: { order: "asc" },
      take: 4,
    })
  } catch {
    // DB not connected
  }

  return (
    <section className="max-w-[1100px] mx-auto px-6 py-20 border-t border-[var(--border)]">
      <AnimatedSection>
        <SectionHeader
          title="Selected Work"
          subtitle="A cross-section of what I've shipped — SaaS platforms, mobile apps, and systems built for scale."
        />
      </AnimatedSection>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {projects.map((project, i) => (
            <AnimatedSection key={project.id} delay={i * 0.07}>
              <ProjectCard project={project} />
            </AnimatedSection>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-6 h-48 animate-pulse"
            />
          ))}
        </div>
      )}

      <AnimatedSection>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          View all projects <ArrowRight size={14} />
        </Link>
      </AnimatedSection>
    </section>
  )
}
