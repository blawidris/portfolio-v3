import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ExperienceForm from "@/components/admin/ExperienceForm"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditExperiencePage({ params }: Props) {
  const { id } = await params
  const experience = await prisma.experience.findUnique({ where: { id } })
  if (!experience) notFound()

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-8">Edit Experience Entry</h1>
      <ExperienceForm id={experience.id} initialData={experience} />
    </div>
  )
}
