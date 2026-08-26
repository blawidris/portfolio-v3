import { notFound } from "next/navigation"
import { getPublicProjectBySlug, getProjectPreview } from "@/lib/content/projects/queries"
import { parseMarkdown } from "@/lib/markdown"
import { buildMetadata } from "@/lib/metadata"
import CaseStudyLayout from "@/components/projects/CaseStudyLayout"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ preview?: string }>
}

async function resolveProject(slug: string, previewToken: string | undefined) {
  const project = await getPublicProjectBySlug(slug)
  if (project) return { project, isPreview: false }

  if (!previewToken) return { project: null, isPreview: false }
  const preview = await getProjectPreview(slug, previewToken)
  return { project: preview, isPreview: !!preview }
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params
  const { preview } = await searchParams
  const { project, isPreview } = await resolveProject(slug, preview)
  if (!project) return {}
  const metadata = buildMetadata({ title: project.title, description: project.description, path: `/projects/${slug}` })
  return isPreview ? { ...metadata, robots: { index: false, follow: false } } : metadata
}

export default async function ProjectDetailPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { preview } = await searchParams
  const { project, isPreview } = await resolveProject(slug, preview)
  if (!project) notFound()

  const contentHtml = parseMarkdown(project.content)

  return <CaseStudyLayout project={project} contentHtml={contentHtml} isPreview={isPreview} />
}
