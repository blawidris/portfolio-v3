import Link from "next/link"
import { ArrowRight } from "lucide-react"
import Badge from "@/components/ui/Badge"
import Tag from "@/components/ui/Tag"
import type { Project } from "@prisma/client"

interface ProjectCardProps {
  project: Project & { coverUrl: string | null }
  showCaseStudyLink?: boolean
}

export default function ProjectCard({ project, showCaseStudyLink = true }: ProjectCardProps) {
  return (
    <div className="group bg-[var(--bg-card)] border border-[var(--border)] rounded-lg overflow-hidden hover:border-[var(--text-muted)] transition-all duration-200 hover:scale-[1.01]">
      {project.coverUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- external R2 URLs
        <img src={project.coverUrl} alt={project.title} className="w-full aspect-video object-cover" />
      )}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="font-display text-xl text-[var(--text-primary)] leading-snug">
            {project.title}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={project.type as "web" | "mobile"} />
            <Badge variant={project.status as "live" | "in-progress" | "archived"} />
          </div>
        </div>

        <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {project.stack.map((tech) => (
            <Tag key={tech} label={tech} />
          ))}
        </div>

        {showCaseStudyLink && (
          <Link
            href={`/projects/${project.slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors group-hover:gap-2"
          >
            Case Study <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </div>
  )
}
