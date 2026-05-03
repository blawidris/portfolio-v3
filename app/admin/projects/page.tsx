import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Plus } from "lucide-react"
import ProjectsTable from "@/components/admin/ProjectsTable"

export default async function AdminProjectsPage() {
  let projects: Awaited<ReturnType<typeof prisma.project.findMany>> = []
  try {
    projects = await prisma.project.findMany({ orderBy: { order: "asc" } })
  } catch {
    // DB not connected
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Projects</h1>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[#0A0A0A] text-sm font-medium rounded-md hover:bg-[var(--accent-hover)] transition-colors"
        >
          <Plus size={15} /> New Project
        </Link>
      </div>

      <ProjectsTable projects={projects} />
    </div>
  )
}
