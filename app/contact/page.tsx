import { buildMetadata } from "@/lib/metadata"
import AnimatedSection from "@/components/ui/AnimatedSection"
import { Mail, Code2, Briefcase, MessageSquare } from "lucide-react"

export const metadata = buildMetadata({
  title: "Contact",
  description: "Get in touch with Idris Lawal for freelance, collaboration, or speaking opportunities.",
  path: "/contact",
})

const links = [
  {
    icon: Mail,
    label: "Email",
    value: "Blawidris@gmail.com",
    href: "mailto:Blawidris@gmail.com",
    note: "Best for project enquiries and freelance work",
  },
  {
    icon: Code2,
    label: "GitHub",
    value: "github.com/idrislawal",
    href: "https://github.com",
    note: "Open source projects and code",
  },
  {
    icon: Briefcase,
    label: "LinkedIn",
    value: "linkedin.com/in/idrislawal",
    href: "https://linkedin.com",
    note: "Professional network and endorsements",
  },
  {
    icon: MessageSquare,
    label: "Twitter / X",
    value: "@idrislawal",
    href: "https://twitter.com",
    note: "Engineering thoughts and hot takes",
  },
]

export default function ContactPage() {
  return (
    <div className="max-w-[1100px] mx-auto px-6 py-16">
      <AnimatedSection>
        <div className="max-w-2xl mb-16">
          <h1 className="font-display text-5xl text-[var(--text-primary)] mb-4">Contact</h1>
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
            Available for senior engineering roles, freelance contracts, technical consulting,
            and collaboration. Based in Lagos, Nigeria — working globally.
          </p>
        </div>
      </AnimatedSection>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        {links.map(({ icon: Icon, label, value, href, note }, i) => (
          <AnimatedSection key={label} delay={i * 0.07}>
            <a
              href={href}
              target={href.startsWith("mailto") ? undefined : "_blank"}
              rel={href.startsWith("mailto") ? undefined : "noopener noreferrer"}
              className="group flex items-start gap-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-5 hover:border-[var(--text-muted)] transition-all duration-200 hover:scale-[1.01]"
            >
              <Icon size={18} className="text-[var(--accent)] mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-0.5">{label}</p>
                <p className="text-[var(--text-primary)] text-sm font-medium mb-1">{value}</p>
                <p className="text-[var(--text-muted)] text-xs">{note}</p>
              </div>
            </a>
          </AnimatedSection>
        ))}
      </div>
    </div>
  )
}
