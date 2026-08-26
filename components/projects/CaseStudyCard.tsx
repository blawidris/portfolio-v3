import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getMediaUrl, StorageNotConfiguredError } from "@/lib/storage/r2"
import type { CaseStudy, Media } from "@prisma/client"

interface CaseStudyCardProps {
  caseStudy: CaseStudy & { coverMedia: Media | null }
}

function coverUrl(media: Media | null) {
  if (!media) return null
  try {
    return getMediaUrl(media.storageKey)
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) return null
    throw error
  }
}

export default function CaseStudyCard({ caseStudy }: CaseStudyCardProps) {
  const cover = coverUrl(caseStudy.coverMedia)

  return (
    <Link
      href={`/case-studies/${caseStudy.slug}`}
      className="group block bg-[var(--bg-card)] border border-[var(--border)] rounded-lg overflow-hidden hover:border-[var(--text-muted)] transition-all duration-200 hover:scale-[1.01]"
    >
      {cover && (
        // eslint-disable-next-line @next/next/no-img-element -- external R2 URLs
        <img src={cover} alt={caseStudy.title} className="w-full aspect-video object-cover" />
      )}
      <div className="p-6">
        <h3 className="font-display text-xl text-[var(--text-primary)] leading-snug mb-2">
          {caseStudy.title}
        </h3>
        <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4">
          {caseStudy.summary}
        </p>
        <span className="inline-flex items-center gap-1 text-xs text-[var(--accent)] group-hover:gap-2 transition-all">
          Read <ArrowRight size={12} />
        </span>
      </div>
    </Link>
  )
}
