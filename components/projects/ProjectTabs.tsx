"use client"

import { useRouter, useSearchParams } from "next/navigation"
import ProjectCard from "@/components/projects/ProjectCard"
import type { Project } from "@prisma/client"

const TABS = [
  { value: "all", label: "All" },
  { value: "web", label: "Web & Backend" },
  { value: "mobile", label: "Mobile" },
]

interface ProjectTabsProps {
  projects: (Project & { coverUrl: string | null })[]
}

export default function ProjectTabs({ projects }: ProjectTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("type") ?? "all"

  const filtered =
    activeTab === "all" ? projects : projects.filter((p) => p.type === activeTab)

  function setTab(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete("type")
    } else {
      params.set("type", value)
    }
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div>
      <div className="flex items-center gap-1 mb-10 bg-[var(--bg-secondary)] rounded-lg p-1 w-fit border border-[var(--border)]">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setTab(tab.value)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-[var(--text-muted)] text-sm text-center py-12">
          No projects found.
        </p>
      )}
    </div>
  )
}
