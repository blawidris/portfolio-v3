import { getPublishedPostSitemapEntries } from "@/lib/content/articles/queries"
import { getPublicProjectSitemapEntries } from "@/lib/content/projects/queries"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://idrislawal.dev"

export const dynamic = "force-dynamic"

export default async function sitemap() {
  const [posts, projects] = await Promise.all([
    getPublishedPostSitemapEntries(),
    getPublicProjectSitemapEntries(),
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
  ]
}
