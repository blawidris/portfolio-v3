import { buildMetadata } from "@/lib/metadata"
import AnimatedSection from "@/components/ui/AnimatedSection"
import Tag from "@/components/ui/Tag"

export const metadata = buildMetadata({
  title: "About",
  description: "Senior software engineer, Lagos Nigeria. Building SaaS and mobile apps for African markets.",
  path: "/about",
})

const experience = [
  {
    role: "Senior Software Engineer",
    company: "EonsFleet Mobility Solutions",
    period: "2022 – Present",
    description:
      "Architected a multi-tenant fleet management SaaS — real-time vehicle tracking, driver management, billing engine, and reporting dashboard. Serves logistics companies across West Africa.",
  },
  {
    role: "Full-Stack Engineer",
    company: "TTS Nigeria / 3MTT Platform",
    period: "2023 – Present",
    description:
      "Building the technical training management platform for Nigeria's 3 Million Technical Talent programme. Multi-role auth, cohort management, progress tracking, and certificate issuance.",
  },
  {
    role: "Backend Engineer",
    company: "Davton LMS",
    period: "2021 – 2022",
    description:
      "Designed and built the API for a learning management system — course delivery, assessment engine, multi-instructor support, and Paystack payments integration.",
  },
  {
    role: "Mobile Engineer",
    company: "Paybills / PHR & Tele-consulting",
    period: "2020 – 2022",
    description:
      "Built cross-platform mobile applications using React Native — bill payments, health records management, and teleconsulting features with real-time video.",
  },
]

const principles = [
  "Correctness before performance — a fast wrong answer is worse than a slow right one.",
  "Design for the failure case first — distributed systems fail in interesting ways.",
  "Ship incrementally — large PRs are a risk surface, not a sign of effort.",
  "Measure before optimising — premature optimisation is still the root of most evil.",
  "Build for maintainability — future you will thank present you.",
]

export default function AboutPage() {
  return (
    <div className="max-w-[1100px] mx-auto px-6 py-16">
      <AnimatedSection>
        <div className="max-w-2xl mb-20">
          <h1 className="font-display text-5xl text-[var(--text-primary)] mb-6">About</h1>
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed mb-4">
            I&apos;m Idris Lawal — a senior software engineer based in Lagos, Nigeria.
            I specialise in building scalable SaaS backends, multi-tenant systems, and
            cross-platform mobile applications.
          </p>
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed mb-4">
            My work spans fintech, logistics, edtech, and health-tech — always with a focus
            on reliability, performance, and the real constraints of building for African markets:
            variable connectivity, diverse devices, cost-conscious infrastructure.
          </p>
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
            I believe great software is built through clear thinking, strong opinions loosely held,
            and an obsession with correctness. I care deeply about the craft.
          </p>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        <section className="mb-20">
          <h2 className="font-display text-3xl text-[var(--text-primary)] mb-8">Experience</h2>
          <div className="space-y-10">
            {experience.map((item, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-8">
                <div className="text-sm text-[var(--text-muted)] pt-0.5">{item.period}</div>
                <div>
                  <h3 className="text-[var(--text-primary)] font-medium mb-0.5">{item.role}</h3>
                  <p className="text-[var(--accent)] text-sm mb-2">{item.company}</p>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection delay={0.2}>
        <section className="mb-20">
          <h2 className="font-display text-3xl text-[var(--text-primary)] mb-6">Engineering Philosophy</h2>
          <ul className="space-y-3">
            {principles.map((p, i) => (
              <li key={i} className="flex items-start gap-3 text-[var(--text-secondary)] text-sm leading-relaxed">
                <span className="text-[var(--accent)] mt-0.5">—</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </section>
      </AnimatedSection>

      <AnimatedSection delay={0.3}>
        <section>
          <h2 className="font-display text-3xl text-[var(--text-primary)] mb-6">Core Stack</h2>
          <div className="flex flex-wrap gap-2">
            {[
              "Node.js", "TypeScript", "Next.js", "React Native", "PostgreSQL",
              "Prisma", "Redis", "Docker", "AWS", "Vercel", "Neon",
              "Tailwind CSS", "Framer Motion",
            ].map((tech) => (
              <Tag key={tech} label={tech} />
            ))}
          </div>
        </section>
      </AnimatedSection>
    </div>
  )
}
