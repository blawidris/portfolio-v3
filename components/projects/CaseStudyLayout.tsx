import Badge from "@/components/ui/Badge"
import Tag from "@/components/ui/Tag"
import type { Project } from "@prisma/client"

interface CaseStudyLayoutProps {
  project: Project
  contentHtml: string
}

export default function CaseStudyLayout({ project, contentHtml }: CaseStudyLayoutProps) {
  const date = new Date(project.createdAt).getFullYear()

  return (
    <article className="max-w-[1100px] mx-auto px-6 py-16">
      <div className="max-w-2xl mb-12">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant={project.type as "web" | "mobile"} />
          <Badge variant={project.status as "live" | "in-progress" | "archived"} />
          <span className="text-xs text-[var(--text-muted)]">{date}</span>
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

      <div
        className="prose prose-invert max-w-none prose-headings:font-display prose-a:text-[var(--accent)] prose-a:no-underline hover:prose-a:underline"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </article>
  )
}
