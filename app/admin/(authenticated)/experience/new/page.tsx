import { prisma } from "@/lib/prisma"
import ExperienceForm from "@/components/admin/ExperienceForm"

export default async function NewExperiencePage() {
  const count = await prisma.experience.count()

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-8">New Experience Entry</h1>
      <ExperienceForm nextOrder={count} />
    </div>
  )
}
