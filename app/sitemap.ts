import { prisma } from "@/lib/prisma"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://idrislawal.dev"

export default async function sitemap() {
  let posts: { slug: string }[] = []
  let projects: { slug: string }[] = []

  try {
    posts = await prisma.post.findMany({ where: { published: true }, select: { slug: true } })
    projects = await prisma.project.findMany({ select: { slug: true } })
  } catch {
    // DB not available at build time
  }

  return [
    { url: siteUrl, lastModified: new Date() },
    { url: `${siteUrl}/about`, lastModified: new Date() },
    { url: `${siteUrl}/projects`, lastModified: new Date() },
    { url: `${siteUrl}/writing`, lastModified: new Date() },
    { url: `${siteUrl}/uses`, lastModified: new Date() },
    { url: `${siteUrl}/contact`, lastModified: new Date() },
    ...posts.map((p) => ({ url: `${siteUrl}/writing/${p.slug}`, lastModified: new Date() })),
    ...projects.map((p) => ({ url: `${siteUrl}/projects/${p.slug}`, lastModified: new Date() })),
  ]
}
