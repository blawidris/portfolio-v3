import { prisma } from "@/lib/prisma"
import CaseStudyForm from "@/components/admin/CaseStudyForm"

export default async function NewCaseStudyPage() {
  const projects = await prisma.project.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } })

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-8">New Case Study</h1>
      <CaseStudyForm projects={projects} />
    </div>
  )
}
