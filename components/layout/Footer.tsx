import { prisma } from "@/lib/prisma"
import * as Icons from "lucide-react"
import Link from "next/link"

type LucideIconName = keyof typeof Icons

function DynamicIcon({ name }: { name: string }) {
  const Icon = Icons[name as LucideIconName] as React.ComponentType<{ size?: number; className?: string }>
  if (!Icon) return null
  return <Icon size={18} />
}

export default async function Footer() {
  let links: { id: string; label: string; url: string; icon: string }[] = []
  try {
    links = await prisma.footerLink.findMany({ orderBy: { order: "asc" } })
  } catch {
    // DB not connected yet — render without links
  }

  return (
    <footer className="border-t border-[var(--border)] mt-24">
      <div className="max-w-[1100px] mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-[var(--text-muted)]">
          © {new Date().getFullYear()} Idris Lawal
        </p>
        {links.length > 0 && (
          <div className="flex items-center gap-4">
            {links.map((link) => (
              <Link
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                aria-label={link.label}
              >
                <DynamicIcon name={link.icon} />
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </footer>
  )
}
