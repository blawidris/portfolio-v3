import { getProfile } from "@/lib/content/profile/queries"
import { getFooterLinks } from "@/lib/content/footer-links/queries"
import HeroContent from "@/components/home/HeroContent"

export default async function Hero() {
  const [profile, footerLinks] = await Promise.all([getProfile(), getFooterLinks()])

  // Reuses the already-correct FooterLink data instead of separately
  // hardcoded (and previously stale) social URLs.
  const githubUrl = footerLinks.find((link) => link.icon === "Github")?.url
  const linkedinUrl = footerLinks.find((link) => link.icon === "Linkedin")?.url

  return (
    <HeroContent
      headline={profile?.headline ?? ""}
      tagline={profile?.tagline ?? ""}
      availability={profile?.availability ?? "Available for work"}
      githubUrl={githubUrl}
      linkedinUrl={linkedinUrl}
    />
  )
}
