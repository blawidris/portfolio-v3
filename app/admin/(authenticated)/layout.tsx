import { redirect } from "next/navigation"
import { auth } from "@/auth"
import AdminSidebar from "@/components/admin/AdminSidebar"

export default async function AuthenticatedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/admin/login")

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">{children}</div>
      </div>
    </div>
  )
}
