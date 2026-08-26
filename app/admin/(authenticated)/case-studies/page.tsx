import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Plus } from "lucide-react"
import CaseStudiesTable from "@/components/admin/CaseStudiesTable"

export default async function AdminCaseStudiesPage() {
  const caseStudies = await prisma.caseStudy.findMany({ orderBy: { order: "asc" } })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Case Studies</h1>
        <Link
          href="/admin/case-studies/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[#0A0A0A] text-sm font-medium rounded-md hover:bg-[var(--accent-hover)] transition-colors"
        >
          <Plus size={15} /> New Case Study
        </Link>
      </div>

      <CaseStudiesTable caseStudies={caseStudies} />
    </div>
  )
}
