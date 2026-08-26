import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import CaseStudyForm from "@/components/admin/CaseStudyForm"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditCaseStudyPage({ params }: Props) {
  const { id } = await params
  const [caseStudy, projects] = await Promise.all([
    prisma.caseStudy.findUnique({ where: { id } }),
    prisma.project.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
  ])
  if (!caseStudy) notFound()

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-8">Edit Case Study</h1>
      <CaseStudyForm id={caseStudy.id} initialData={caseStudy} projects={projects} />
    </div>
  )
}
