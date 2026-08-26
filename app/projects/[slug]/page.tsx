import { notFound } from "next/navigation"
import { getPublicProjectBySlug } from "@/lib/content/projects/queries"
import { parseMarkdown } from "@/lib/markdown"
import { buildMetadata } from "@/lib/metadata"
import CaseStudyLayout from "@/components/projects/CaseStudyLayout"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = await getPublicProjectBySlug(slug)
  if (!project) return {}
  return buildMetadata({ title: project.title, description: project.description, path: `/projects/${slug}` })
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params
  const project = await getPublicProjectBySlug(slug)
  if (!project) notFound()

  const contentHtml = parseMarkdown(project.content)

  return <CaseStudyLayout project={project} contentHtml={contentHtml} />
}
