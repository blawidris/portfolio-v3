"use client"

type BadgeVariant =
  | "available"
  | "live"
  | "in-progress"
  | "archived"
  | "web"
  | "mobile"
  | "published"
  | "draft"

const variantStyles: Record<BadgeVariant, string> = {
  available: "bg-[var(--accent-dim)] text-[var(--accent)] border-[var(--accent-dim)]",
  live: "bg-[var(--accent-dim)] text-[var(--accent)] border-[var(--accent-dim)]",
  "in-progress": "bg-yellow-900/30 text-yellow-400 border-yellow-900",
  archived: "bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border)]",
  web: "bg-blue-900/30 text-blue-400 border-blue-900",
  mobile: "bg-purple-900/30 text-purple-400 border-purple-900",
  published: "bg-[var(--accent-dim)] text-[var(--accent)] border-[var(--accent-dim)]",
  draft: "bg-yellow-900/30 text-yellow-400 border-yellow-900",
}

const variantLabels: Record<BadgeVariant, string> = {
  available: "Available for work",
  live: "Live",
  "in-progress": "In Progress",
  archived: "Archived",
  web: "Web",
  mobile: "Mobile",
  published: "Published",
  draft: "Draft",
}

interface BadgeProps {
  variant: BadgeVariant
  label?: string
  className?: string
}

export default function Badge({ variant, label, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      {label ?? variantLabels[variant]}
    </span>
  )
}
