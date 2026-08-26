import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getPublicProjects } from "@/lib/content/projects/queries"
import { getMediaUrl, StorageNotConfiguredError } from "@/lib/storage/r2"
import AnimatedSection from "@/components/ui/AnimatedSection"
import SectionHeader from "@/components/ui/SectionHeader"
import ProjectCard from "@/components/projects/ProjectCard"

export default async function SelectedWork() {
  const rawProjects = await getPublicProjects({ featured: true, take: 4 })
  const projects = rawProjects.map((project) => {
    let coverUrl: string | null = null
    if (project.coverMedia) {
      try {
        coverUrl = getMediaUrl(project.coverMedia.storageKey)
      } catch (error) {
        if (!(error instanceof StorageNotConfiguredError)) throw error
      }
    }
    return { ...project, coverUrl }
  })

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
