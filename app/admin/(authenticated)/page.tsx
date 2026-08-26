import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { FileText, FolderOpen, Link as LinkIcon, ArrowRight } from "lucide-react"

export default async function AdminDashboard() {
  const [posts, projects, footerLinks] = await Promise.all([
    prisma.post.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.project.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.footerLink.count(),
  ])

  const stats = {
    totalPosts: posts.length,
    publishedPosts: posts.filter((post) => post.published).length,
    draftPosts: posts.filter((post) => !post.published).length,
    totalProjects: projects.length,
    featuredProjects: projects.filter((project) => project.featured).length,
    footerLinks,
  }

  const recentActivity: { type: "post" | "project"; id: string; title: string; updatedAt: Date }[] = [
    ...posts.slice(0, 3).map((post) => ({ type: "post" as const, id: post.id, title: post.title, updatedAt: post.updatedAt })),
    ...projects.slice(0, 2).map((project) => ({ type: "project" as const, id: project.id, title: project.title, updatedAt: project.updatedAt })),
  ]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5)

  const statCards = [
    { label: "Total Posts", value: stats.totalPosts, sub: `${stats.publishedPosts} published · ${stats.draftPosts} drafts`, icon: FileText, href: "/admin/posts" },
    { label: "Projects", value: stats.totalProjects, sub: `${stats.featuredProjects} featured`, icon: FolderOpen, href: "/admin/projects" },
    { label: "Footer Links", value: stats.footerLinks, sub: "Social & contact links", icon: LinkIcon, href: "/admin/settings" },
  ]

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {statCards.map(({ label, value, sub, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="group bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-5 hover:border-[var(--text-muted)] transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <Icon size={16} className="text-[var(--text-muted)]" />
              <ArrowRight size={14} className="text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors" />
            </div>
            <p className="text-3xl font-semibold text-[var(--text-primary)] mb-1">{value}</p>
            <p className="text-xs text-[var(--text-muted)] mb-0.5">{label}</p>
            <p className="text-xs text-[var(--text-muted)]">{sub}</p>
          </Link>
        ))}
      </div>

      {recentActivity.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-4">
            Recent Activity
          </h2>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg divide-y divide-[var(--border)]">
            {recentActivity.map((item) => (
              <Link
                key={item.id}
                href={`/admin/${item.type === "post" ? "posts" : "projects"}/${item.id}/edit`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  {item.type === "post" ? (
                    <FileText size={14} className="text-[var(--text-muted)]" />
                  ) : (
                    <FolderOpen size={14} className="text-[var(--text-muted)]" />
                  )}
                  <span className="text-sm text-[var(--text-primary)]">{item.title}</span>
                </div>
                <span className="text-xs text-[var(--text-muted)]">
                  {new Date(item.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
