import { prisma } from "@/lib/prisma"
import SkillsManager from "@/components/admin/SkillsManager"

export default async function AdminSkillsPage() {
  const categories = await prisma.skillCategory.findMany({
    orderBy: { order: "asc" },
    include: { skills: { orderBy: { order: "asc" } } },
  })

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-8">Skills</h1>
      <SkillsManager categories={categories} />
    </div>
  )
}
