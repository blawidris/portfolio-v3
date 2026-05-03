import AdminSidebar from "@/components/admin/AdminSidebar"
import { SessionProvider } from "next-auth/react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-8 py-8">{children}</div>
        </div>
      </div>
    </SessionProvider>
  )
}
