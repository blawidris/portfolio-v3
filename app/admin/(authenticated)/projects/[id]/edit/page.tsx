import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ProjectForm from "@/components/admin/ProjectForm"
import ProjectExtrasManager from "@/components/admin/ProjectExtrasManager"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      images: { include: { media: true }, orderBy: { order: "asc" } },
      challenges: { orderBy: { order: "asc" } },
      metrics: { orderBy: { order: "asc" } },
    },
  })
  if (!project) notFound()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://idrislawal.dev"

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-8">Edit Project</h1>
      <ProjectForm id={project.id} initialData={project} />

      <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-12 mb-6">Case Study Details</h2>
      <ProjectExtrasManager
        projectId={project.id}
        projectSlug={project.slug}
        images={project.images}
        challenges={project.challenges}
        metrics={project.metrics}
        previewToken={project.previewToken}
        siteUrl={siteUrl}
      />
    </div>
  )
}
