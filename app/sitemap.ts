import { getPublishedPostSitemapEntries } from "@/lib/content/articles/queries"
import { getPublicProjectSitemapEntries } from "@/lib/content/projects/queries"
import { getPublicCaseStudySitemapEntries } from "@/lib/content/case-studies/queries"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://idrislawal.dev"

export const dynamic = "force-dynamic"

export default async function sitemap() {
  const [posts, projects, caseStudies] = await Promise.all([
    getPublishedPostSitemapEntries(),
    getPublicProjectSitemapEntries(),
    getPublicCaseStudySitemapEntries(),
  ])

  return [
    { url: siteUrl, lastModified: new Date() },
    { url: `${siteUrl}/about`, lastModified: new Date() },
    { url: `${siteUrl}/projects`, lastModified: new Date() },
    { url: `${siteUrl}/writing`, lastModified: new Date() },
    { url: `${siteUrl}/uses`, lastModified: new Date() },
    { url: `${siteUrl}/contact`, lastModified: new Date() },
    ...posts.map((p) => ({ url: `${siteUrl}/writing/${p.slug}`, lastModified: p.updatedAt })),
    ...projects.map((p) => ({ url: `${siteUrl}/projects/${p.slug}`, lastModified: p.updatedAt })),
    ...caseStudies.map((c) => ({ url: `${siteUrl}/case-studies/${c.slug}`, lastModified: c.updatedAt })),
  ]
}
