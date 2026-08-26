import { Suspense } from "react"
import { getPublicProjects } from "@/lib/content/projects/queries"
import { buildMetadata } from "@/lib/metadata"
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
  const projects = await getPublicProjects()

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
