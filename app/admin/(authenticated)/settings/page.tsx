import { prisma } from "@/lib/prisma"
import FooterLinkForm from "@/components/admin/FooterLinkForm"
import ChangePasswordForm from "@/components/admin/ChangePasswordForm"
import ProfileForm from "@/components/admin/ProfileForm"
import ResumeUploadForm from "@/components/admin/ResumeUploadForm"
import NavigationForm from "@/components/admin/NavigationForm"

export default async function AdminSettingsPage() {
  const [links, navItems, profile, resumes] = await Promise.all([
    prisma.footerLink.findMany({ orderBy: { order: "asc" } }),
    prisma.navigationItem.findMany({ orderBy: { order: "asc" } }),
    prisma.profile.findUnique({ where: { id: "profile" } }),
    prisma.resume.findMany({ orderBy: { createdAt: "desc" }, include: { media: true } }),
  ])

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Settings</h1>
      <ChangePasswordForm />
      {profile && <ProfileForm profile={profile} />}
      <ResumeUploadForm resumes={resumes} />
      <NavigationForm items={navItems} />
      <FooterLinkForm links={links} />
    </div>
  )
}
