import Badge from "@/components/ui/Badge"
import Tag from "@/components/ui/Tag"
import { getMediaUrl, StorageNotConfiguredError } from "@/lib/storage/r2"
import type { Media, Project, ProjectChallenge, ProjectImage, ProjectMetric } from "@prisma/client"

type ProjectWithExtras = Project & {
  coverMedia: Media | null
  images: (ProjectImage & { media: Media })[]
  challenges: ProjectChallenge[]
  metrics: ProjectMetric[]
}

interface CaseStudyLayoutProps {
  project: ProjectWithExtras
  contentHtml: string
  isPreview?: boolean
}

function mediaUrl(media: Media | null) {
  if (!media) return null
  try {
    return getMediaUrl(media.storageKey)
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) return null
    throw error
  }
}

export default function CaseStudyLayout({ project, contentHtml, isPreview = false }: CaseStudyLayoutProps) {
  const coverUrl = mediaUrl(project.coverMedia)
  const gallery = project.images.filter((image) => image.role === "gallery")
  const diagrams = project.images.filter((image) => image.role === "diagram")

  return (
    <article className="max-w-[1100px] mx-auto px-6 py-16">
      {isPreview && (
        <div className="mb-8 px-4 py-2.5 bg-yellow-900/20 border border-yellow-900/40 rounded-md text-sm text-yellow-400">
          Draft preview — this project is not published.
        </div>
      )}

      <div className="max-w-2xl mb-12">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant={project.type as "web" | "mobile"} />
          <Badge variant={project.status as "live" | "in-progress" | "archived"} />
          <span className="text-xs text-[var(--text-muted)]">{project.year}</span>
        </div>

        <h1 className="font-display text-4xl md:text-5xl text-[var(--text-primary)] leading-tight mb-4">
          {project.title}
        </h1>

        <p className="text-[var(--text-secondary)] text-lg leading-relaxed mb-6">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {project.stack.map((tech) => (
            <Tag key={tech} label={tech} />
          ))}
        </div>
      </div>

      {coverUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- external R2 URLs, not optimizable by next/image without a loader config
        <img src={coverUrl} alt={project.title} className="w-full rounded-lg mb-12 object-cover" />
      )}

      {project.metrics.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {project.metrics.map((metric) => (
            <div key={metric.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4">
              <div className="text-2xl font-display text-[var(--accent)] mb-1">{metric.value}</div>
              <div className="text-xs text-[var(--text-muted)]">{metric.label}</div>
              {metric.context && <div className="text-xs text-[var(--text-muted)] mt-1">{metric.context}</div>}
            </div>
          ))}
        </div>
      )}

      <div
        className="prose prose-invert max-w-none prose-headings:font-display prose-a:text-[var(--accent)] prose-a:no-underline hover:prose-a:underline mb-12"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />

      {project.challenges.length > 0 && (
        <section className="mb-12">
          <h2 className="font-display text-2xl text-[var(--text-primary)] mb-6">Challenges</h2>
          <div className="space-y-6">
            {project.challenges.map((challenge) => (
              <div key={challenge.id}>
                <h3 className="text-[var(--text-primary)] font-medium mb-1">{challenge.title}</h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{challenge.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {diagrams.length > 0 && (
        <section className="mb-12">
          <h2 className="font-display text-2xl text-[var(--text-primary)] mb-6">Diagrams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {diagrams.map((image) => {
              const url = mediaUrl(image.media)
              if (!url) return null
              return (
                <figure key={image.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- external R2 URLs */}
                  <img src={url} alt={image.caption ?? project.title} className="w-full rounded-lg" />
                  {image.caption && <figcaption className="text-xs text-[var(--text-muted)] mt-2">{image.caption}</figcaption>}
                </figure>
              )
            })}
          </div>
        </section>
      )}

      {gallery.length > 0 && (
        <section>
          <h2 className="font-display text-2xl text-[var(--text-primary)] mb-6">Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {gallery.map((image) => {
              const url = mediaUrl(image.media)
              if (!url) return null
              return (
                <figure key={image.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- external R2 URLs */}
                  <img src={url} alt={image.caption ?? project.title} className="w-full aspect-video object-cover rounded-lg" />
                  {image.caption && <figcaption className="text-xs text-[var(--text-muted)] mt-2">{image.caption}</figcaption>}
                </figure>
              )
            })}
          </div>
        </section>
      )}
    </article>
  )
}
