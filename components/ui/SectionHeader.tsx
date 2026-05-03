interface SectionHeaderProps {
  title: string
  subtitle?: string
  align?: "left" | "center"
}

export default function SectionHeader({ title, subtitle, align = "left" }: SectionHeaderProps) {
  return (
    <div className={`mb-12 ${align === "center" ? "text-center" : ""}`}>
      <h2 className="font-display text-3xl md:text-4xl text-[var(--text-primary)] mb-3">
        {title}
      </h2>
      {subtitle && (
        <p className="text-[var(--text-secondary)] text-base max-w-xl">
          {subtitle}
        </p>
      )}
    </div>
  )
}
