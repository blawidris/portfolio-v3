import { notFound } from "next/navigation"
import Link from "next/link"
import { getPublicCaseStudyBySlug, getCaseStudyPreview } from "@/lib/content/case-studies/queries"
import { parseMarkdown } from "@/lib/markdown"
import { buildMetadata } from "@/lib/metadata"
import { getMediaUrl, StorageNotConfiguredError } from "@/lib/storage/r2"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ preview?: string }>
}

async function resolveCaseStudy(slug: string, previewToken: string | undefined) {
  const caseStudy = await getPublicCaseStudyBySlug(slug)
  if (caseStudy) return { caseStudy, isPreview: false }

  if (!previewToken) return { caseStudy: null, isPreview: false }
  const preview = await getCaseStudyPreview(slug, previewToken)
  return { caseStudy: preview, isPreview: !!preview }
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params
  const { preview } = await searchParams
  const { caseStudy, isPreview } = await resolveCaseStudy(slug, preview)
  if (!caseStudy) return {}
  const metadata = buildMetadata({ title: caseStudy.title, description: caseStudy.summary, path: `/case-studies/${slug}` })
  return isPreview ? { ...metadata, robots: { index: false, follow: false } } : metadata
}

export default async function CaseStudyDetailPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { preview } = await searchParams
  const { caseStudy, isPreview } = await resolveCaseStudy(slug, preview)
  if (!caseStudy) notFound()

  const contentHtml = parseMarkdown(caseStudy.content)

  let coverUrl: string | null = null
  if (caseStudy.coverMedia) {
    try {
      coverUrl = getMediaUrl(caseStudy.coverMedia.storageKey)
    } catch (error) {
      if (!(error instanceof StorageNotConfiguredError)) throw error
    }
  }

  return (
    <article className="max-w-[700px] mx-auto px-6 py-16">
      {isPreview && (
        <div className="mb-8 px-4 py-2.5 bg-yellow-900/20 border border-yellow-900/40 rounded-md text-sm text-yellow-400">
          Draft preview — this case study is not published.
        </div>
      )}

      <header className="mb-10">
        <h1 className="font-display text-4xl md:text-5xl text-[var(--text-primary)] leading-tight mb-4">
          {caseStudy.title}
        </h1>
        <p className="text-[var(--text-secondary)] text-lg leading-relaxed mb-4">
          {caseStudy.summary}
        </p>
        {caseStudy.project && (
          <Link href={`/projects/${caseStudy.project.slug}`} className="text-sm text-[var(--accent)] hover:underline">
            Part of {caseStudy.project.title} →
          </Link>
        )}
      </header>

      {coverUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- external R2 URLs
        <img src={coverUrl} alt={caseStudy.title} className="w-full rounded-lg mb-10 object-cover" />
      )}

      <div
        className="prose prose-invert max-w-none prose-headings:font-display prose-a:text-[var(--accent)] prose-a:no-underline hover:prose-a:underline"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </article>
  )
}
