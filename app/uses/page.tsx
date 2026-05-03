import { buildMetadata } from "@/lib/metadata"
import AnimatedSection from "@/components/ui/AnimatedSection"

export const metadata = buildMetadata({
  title: "Uses",
  description: "Hardware, software, and tools I use daily as a senior software engineer.",
  path: "/uses",
})

const sections = [
  {
    title: "Languages & Runtimes",
    items: [
      { name: "TypeScript", note: "Primary language — always strict mode" },
      { name: "Node.js", note: "Backend and API work" },
      { name: "JavaScript", note: "Where TypeScript isn't an option" },
    ],
  },
  {
    title: "Frontend",
    items: [
      { name: "Next.js (App Router)", note: "Primary web framework" },
      { name: "React", note: "UI library" },
      { name: "Tailwind CSS", note: "Utility-first styling" },
      { name: "Framer Motion", note: "Animations" },
    ],
  },
  {
    title: "Mobile",
    items: [
      { name: "React Native", note: "Cross-platform mobile" },
      { name: "Expo", note: "For rapid prototyping" },
    ],
  },
  {
    title: "Backend & Database",
    items: [
      { name: "PostgreSQL", note: "Primary database" },
      { name: "Neon", note: "Serverless Postgres in production" },
      { name: "Prisma", note: "ORM" },
      { name: "Redis", note: "Caching and queues" },
    ],
  },
  {
    title: "Infrastructure",
    items: [
      { name: "Vercel", note: "Web deployment" },
      { name: "AWS (EC2, S3, RDS)", note: "Heavier infrastructure" },
      { name: "Docker", note: "Local dev and CI" },
      { name: "GitHub Actions", note: "CI/CD" },
    ],
  },
  {
    title: "Tools",
    items: [
      { name: "VS Code", note: "Daily driver" },
      { name: "Warp", note: "Terminal" },
      { name: "Postman", note: "API testing" },
      { name: "TablePlus", note: "Database GUI" },
      { name: "Linear", note: "Project management" },
      { name: "Figma", note: "Design collaboration" },
    ],
  },
  {
    title: "Hardware",
    items: [
      { name: "MacBook Pro M-series", note: "Primary machine" },
      { name: "27\" External Monitor", note: "Extended workspace" },
      { name: "Mechanical Keyboard", note: "Tactile switches" },
    ],
  },
]

export default function UsesPage() {
  return (
    <div className="max-w-[1100px] mx-auto px-6 py-16">
      <AnimatedSection>
        <div className="max-w-2xl mb-16">
          <h1 className="font-display text-5xl text-[var(--text-primary)] mb-4">Uses</h1>
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
            The hardware, software, and tools that make up my daily engineering environment.
          </p>
        </div>
      </AnimatedSection>

      <div className="space-y-12">
        {sections.map((section, i) => (
          <AnimatedSection key={section.title} delay={i * 0.05}>
            <h2 className="font-display text-2xl text-[var(--text-primary)] mb-4 pb-3 border-b border-[var(--border)]">
              {section.title}
            </h2>
            <div className="space-y-3">
              {section.items.map((item) => (
                <div key={item.name} className="flex items-baseline gap-4">
                  <span className="text-[var(--text-primary)] text-sm font-medium min-w-[200px]">
                    {item.name}
                  </span>
                  <span className="text-[var(--text-muted)] text-sm">{item.note}</span>
                </div>
              ))}
            </div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  )
}
