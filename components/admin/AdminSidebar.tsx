"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { LayoutDashboard, FileText, FolderOpen, Image as ImageIcon, Briefcase, Sparkles, Award, Settings, LogOut } from "lucide-react"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/posts", label: "Posts", icon: FileText, exact: false },
  { href: "/admin/projects", label: "Projects", icon: FolderOpen, exact: false },
  { href: "/admin/experience", label: "Experience", icon: Briefcase, exact: false },
  { href: "/admin/skills", label: "Skills", icon: Sparkles, exact: false },
  { href: "/admin/certifications", label: "Certifications", icon: Award, exact: false },
  { href: "/admin/media", label: "Media", icon: ImageIcon, exact: false },
  { href: "/admin/settings", label: "Settings", icon: Settings, exact: false },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  return (
    <aside className="w-56 shrink-0 flex flex-col bg-[var(--bg-secondary)] border-r border-[var(--border)] min-h-screen">
      <div className="px-5 py-5 border-b border-[var(--border)]">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-mono text-[var(--accent)] font-bold">IL</span>
          <span className="text-xs text-[var(--text-muted)]">Admin</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              isActive(href, exact)
                ? "bg-[var(--bg-card)] text-[var(--text-primary)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-card)]"
            }`}
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-3 pb-5">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm text-[var(--text-muted)] hover:text-red-400 hover:bg-red-900/10 transition-colors"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
