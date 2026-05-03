interface TagProps {
  label: string
  className?: string
}

export default function Tag({ label, className = "" }: TagProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border)] ${className}`}
    >
      {label}
    </span>
  )
}
