import "server-only"

import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import { contentTags } from "@/lib/content/cache"
import { publicProjectWhere } from "@/lib/content/publication"
import { executeContentQuery } from "@/lib/content/query"

const detailInclude = {
  coverMedia: true,
  images: { include: { media: true }, orderBy: { order: "asc" as const } },
  challenges: { orderBy: { order: "asc" as const } },
  metrics: { orderBy: { order: "asc" as const } },
}

export async function queryPublicProjects(options: { featured?: boolean; take?: number } = {}) {
  return executeContentQuery("projects.list", () => prisma.project.findMany({
    where: { ...publicProjectWhere, ...(options.featured === undefined ? {} : { featured: options.featured }) },
    orderBy: { order: "asc" },
    include: { coverMedia: true },
    ...(options.take ? { take: options.take } : {}),
  }))
}

export function getPublicProjects(options: { featured?: boolean; take?: number } = {}) {
  const featured = options.featured
  const take = options.take
  return unstable_cache(
    () => queryPublicProjects({ featured, take }),
    ["public-projects", String(featured ?? "all"), String(take ?? "all")],
    { tags: [contentTags.projects], revalidate: 3600 },
  )()
}

export async function queryPublicProjectBySlug(slug: string) {
  return executeContentQuery("projects.detail", () =>
    prisma.project.findFirst({ where: { ...publicProjectWhere, slug }, include: detailInclude }),
  )
}

export function getPublicProjectBySlug(slug: string) {
  return unstable_cache(
    () => queryPublicProjectBySlug(slug),
    ["public-project", slug],
    { tags: [contentTags.projects, contentTags.project(slug)], revalidate: 3600 },
  )()
}

// Deliberately uncached — this is the only way to view an unpublished
// project, and Phase 0's rule against caching draft content in a shared
// layer applies directly here. Never wrap this in unstable_cache.
export async function getProjectPreview(slug: string, token: string) {
  if (!token) return null
  return executeContentQuery("projects.preview", () =>
    prisma.project.findFirst({ where: { slug, previewToken: token }, include: detailInclude }),
  )
}

export async function getPublicProjectSitemapEntries() {
  return executeContentQuery("projects.sitemap", () => prisma.project.findMany({
    where: publicProjectWhere,
    select: { slug: true, updatedAt: true },
  }))
}
