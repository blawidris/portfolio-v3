import { buildMetadata } from "@/lib/metadata"
import { getProfile } from "@/lib/content/profile/queries"
import { getVisibleExperience } from "@/lib/content/experience/queries"
import { getVisibleSkillCategories } from "@/lib/content/skills/queries"
import { getVisibleCertifications } from "@/lib/content/certifications/queries"
import { getActiveResume } from "@/lib/content/resume/queries"
import { getMediaUrl, StorageNotConfiguredError } from "@/lib/storage/r2"
import AnimatedSection from "@/components/ui/AnimatedSection"
import Tag from "@/components/ui/Tag"

export const metadata = buildMetadata({
  title: "About",
  description: "Senior software engineer, Lagos Nigeria. Building SaaS and mobile apps for African markets.",
  path: "/about",
})

function resumeUrl(media: { storageKey: string } | null | undefined) {
  if (!media) return null
  try {
    return getMediaUrl(media.storageKey)
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) return null
    throw error
  }
}

export default async function AboutPage() {
  const [profile, experience, skillCategories, certifications, resume] = await Promise.all([
    getProfile(),
    getVisibleExperience(),
    getVisibleSkillCategories(),
    getVisibleCertifications(),
    getActiveResume(),
  ])

  if (!profile) return null

  const bioParagraphs = profile.bio.split(/\n{2,}/).filter(Boolean)
  const skills = skillCategories.flatMap((category) => category.skills)
  const downloadUrl = resumeUrl(resume?.media)

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-16">
      <AnimatedSection>
        <div className="max-w-2xl mb-20">
          <h1 className="font-display text-5xl text-[var(--text-primary)] mb-6">About</h1>
          {bioParagraphs.map((paragraph, i) => (
            <p
              key={i}
              className={`text-[var(--text-secondary)] text-lg leading-relaxed ${i < bioParagraphs.length - 1 ? "mb-4" : ""}`}
            >
              {paragraph}
            </p>
          ))}
          {downloadUrl && (
            <a
              href="/resume"
              className="inline-flex items-center gap-2 mt-6 px-4 py-2 text-sm bg-[var(--accent)] text-[#0A0A0A] rounded-md font-medium hover:bg-[var(--accent-hover)] transition-colors"
            >
              Download Resume
            </a>
          )}
        </div>
      </AnimatedSection>

      {experience.length > 0 && (
        <AnimatedSection delay={0.1}>
          <section className="mb-20">
            <h2 className="font-display text-3xl text-[var(--text-primary)] mb-8">Experience</h2>
            <div className="space-y-10">
              {experience.map((item) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-8">
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
      )}

      {profile.philosophy.length > 0 && (
        <AnimatedSection delay={0.2}>
          <section className="mb-20">
            <h2 className="font-display text-3xl text-[var(--text-primary)] mb-6">Engineering Philosophy</h2>
            <ul className="space-y-3">
              {profile.philosophy.map((principle, i) => (
                <li key={i} className="flex items-start gap-3 text-[var(--text-secondary)] text-sm leading-relaxed">
                  <span className="text-[var(--accent)] mt-0.5">—</span>
                  <span>{principle}</span>
                </li>
              ))}
            </ul>
          </section>
        </AnimatedSection>
      )}

      {skills.length > 0 && (
        <AnimatedSection delay={0.3}>
          <section className={certifications.length > 0 ? "mb-20" : ""}>
            <h2 className="font-display text-3xl text-[var(--text-primary)] mb-6">Core Stack</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Tag key={skill.id} label={skill.name} />
              ))}
            </div>
          </section>
        </AnimatedSection>
      )}

      {certifications.length > 0 && (
        <AnimatedSection delay={0.4}>
          <section>
            <h2 className="font-display text-3xl text-[var(--text-primary)] mb-8">Certifications</h2>
            <div className="space-y-6">
              {certifications.map((cert) => (
                <div key={cert.id} className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-[var(--text-primary)] font-medium mb-0.5">{cert.name}</h3>
                    <p className="text-[var(--text-secondary)] text-sm">
                      {cert.issuer} — {new Date(cert.issueDate).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                    </p>
                  </div>
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[var(--accent)] hover:underline shrink-0"
                    >
                      View credential →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        </AnimatedSection>
      )}
    </div>
  )
}
