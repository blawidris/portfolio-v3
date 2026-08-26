import { revalidateTag } from "next/cache"

export const contentTags = {
  projects: "projects",
  project: (slug: string) => `project:${slug}`,
  articles: "articles",
  article: (slug: string) => `article:${slug}`,
  footerLinks: "footer-links",
  profile: "profile",
  experience: "experience",
  skills: "skills",
  certifications: "certifications",
  resume: "resume",
  navigation: "navigation",
} as const

export function revalidateProjectContent(...slugs: Array<string | undefined>) {
  revalidateTag(contentTags.projects, "max")
  for (const slug of slugs) {
    if (slug) revalidateTag(contentTags.project(slug), "max")
  }
}

export function revalidateArticleContent(...slugs: Array<string | undefined>) {
  revalidateTag(contentTags.articles, "max")
  for (const slug of slugs) {
    if (slug) revalidateTag(contentTags.article(slug), "max")
  }
}

export function revalidateFooterLinks() {
  revalidateTag(contentTags.footerLinks, "max")
}

export function revalidateProfile() {
  revalidateTag(contentTags.profile, "max")
}

export function revalidateExperience() {
  revalidateTag(contentTags.experience, "max")
}

export function revalidateSkills() {
  revalidateTag(contentTags.skills, "max")
}

export function revalidateCertifications() {
  revalidateTag(contentTags.certifications, "max")
}

export function revalidateResume() {
  revalidateTag(contentTags.resume, "max")
}

export function revalidateNavigation() {
  revalidateTag(contentTags.navigation, "max")
}
