import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { parseMarkdown } from "@/lib/markdown"
import { buildMetadata } from "@/lib/metadata"
import CaseStudyLayout from "@/components/projects/CaseStudyLayout"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = await prisma.project.findUnique({ where: { slug } })
  if (!project) return {}
  return buildMetadata({ title: project.title, description: project.description, path: `/projects/${slug}` })
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params
  const project = await prisma.project.findUnique({ where: { slug } })
  if (!project) notFound()

  const contentHtml = parseMarkdown(project.content)

  return <CaseStudyLayout project={project} contentHtml={contentHtml} />
}
