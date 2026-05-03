import { prisma } from "@/lib/prisma"
import FooterLinkForm from "@/components/admin/FooterLinkForm"

export default async function AdminSettingsPage() {
  let links: Awaited<ReturnType<typeof prisma.footerLink.findMany>> = []
  try {
    links = await prisma.footerLink.findMany({ orderBy: { order: "asc" } })
  } catch {
    // DB not connected
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-8">Settings</h1>
      <FooterLinkForm links={links} />
    </div>
  )
}
