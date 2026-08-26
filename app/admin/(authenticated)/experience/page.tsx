import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Plus } from "lucide-react"
import ExperienceTable from "@/components/admin/ExperienceTable"

export default async function AdminExperiencePage() {
  const experience = await prisma.experience.findMany({ orderBy: { order: "asc" } })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Experience</h1>
        <Link
          href="/admin/experience/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[#0A0A0A] text-sm font-medium rounded-md hover:bg-[var(--accent-hover)] transition-colors"
        >
          <Plus size={15} /> New Entry
        </Link>
      </div>

      <ExperienceTable experience={experience} />
    </div>
  )
}
