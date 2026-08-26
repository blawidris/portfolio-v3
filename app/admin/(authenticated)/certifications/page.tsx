import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Plus } from "lucide-react"
import CertificationsTable from "@/components/admin/CertificationsTable"

export default async function AdminCertificationsPage() {
  const certifications = await prisma.certification.findMany({ orderBy: { order: "asc" } })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Certifications</h1>
        <Link
          href="/admin/certifications/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[#0A0A0A] text-sm font-medium rounded-md hover:bg-[var(--accent-hover)] transition-colors"
        >
          <Plus size={15} /> New Certification
        </Link>
      </div>

      <CertificationsTable certifications={certifications} />
    </div>
  )
}
