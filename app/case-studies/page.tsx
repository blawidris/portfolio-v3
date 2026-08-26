import { getPublicCaseStudies } from "@/lib/content/case-studies/queries"
import { buildMetadata } from "@/lib/metadata"
import AnimatedSection from "@/components/ui/AnimatedSection"
import SectionHeader from "@/components/ui/SectionHeader"
import CaseStudyCard from "@/components/projects/CaseStudyCard"

export const metadata = buildMetadata({
  title: "Case Studies",
  description: "In-depth write-ups on engineering decisions, architecture, and outcomes.",
  path: "/case-studies",
})

export default async function CaseStudiesPage() {
  const caseStudies = await getPublicCaseStudies()

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-16">
      <AnimatedSection>
        <SectionHeader
          title="Case Studies"
          subtitle="In-depth write-ups on engineering decisions, architecture, and outcomes."
        />
      </AnimatedSection>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {caseStudies.map((caseStudy, i) => (
          <AnimatedSection key={caseStudy.id} delay={i * 0.05}>
            <CaseStudyCard caseStudy={caseStudy} />
          </AnimatedSection>
        ))}
      </div>

      {caseStudies.length === 0 && (
        <p className="text-[var(--text-muted)] text-sm text-center py-16">
          No case studies published yet.
        </p>
      )}
    </div>
  )
}
