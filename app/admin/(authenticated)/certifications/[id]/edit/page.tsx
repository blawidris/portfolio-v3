import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import CertificationForm from "@/components/admin/CertificationForm"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditCertificationPage({ params }: Props) {
  const { id } = await params
  const certification = await prisma.certification.findUnique({ where: { id } })
  if (!certification) notFound()

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-8">Edit Certification</h1>
      <CertificationForm id={certification.id} initialData={certification} />
    </div>
  )
}
