import { prisma } from "@/lib/prisma"
import CertificationForm from "@/components/admin/CertificationForm"

export default async function NewCertificationPage() {
  const count = await prisma.certification.count()

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-8">New Certification</h1>
      <CertificationForm nextOrder={count} />
    </div>
  )
}
