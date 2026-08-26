import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ProjectForm from "@/components/admin/ProjectForm"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params
  const project = await prisma.project.findUnique({ where: { id } })
  if (!project) notFound()

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-8">Edit Project</h1>
      <ProjectForm id={project.id} initialData={project} />
    </div>
  )
}
