import { Suspense } from "react"
import { getPublicProjects } from "@/lib/content/projects/queries"
import { buildMetadata } from "@/lib/metadata"
import { getMediaUrl, StorageNotConfiguredError } from "@/lib/storage/r2"
import AnimatedSection from "@/components/ui/AnimatedSection"
import SectionHeader from "@/components/ui/SectionHeader"
import ProjectTabs from "@/components/projects/ProjectTabs"

export const metadata = buildMetadata({
  title: "Projects",
  description:
    "SaaS platforms, mobile apps, and distributed systems built for African markets and beyond.",
  path: "/projects",
})

export default async function ProjectsPage() {
  const rawProjects = await getPublicProjects()

  // Resolve cover URLs here, server-side, so ProjectCard (rendered inside
  // the client-side ProjectTabs) never needs to import lib/storage/r2 —
  // that module is server-only and breaks the client bundle if pulled in.
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
    <div className="max-w-[1100px] mx-auto px-6 py-16">
      <AnimatedSection>
        <SectionHeader
          title="Projects"
          subtitle="Seven years of building — SaaS, mobile, fintech, edtech, and logistics."
        />
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        <Suspense>
          <ProjectTabs projects={projects} />
        </Suspense>
      </AnimatedSection>
    </div>
  )
}
