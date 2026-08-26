import "server-only"

import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import { contentTags } from "@/lib/content/cache"
import { publicProjectWhere } from "@/lib/content/publication"
import { executeContentQuery } from "@/lib/content/query"

export async function queryPublicProjects(options: { featured?: boolean; take?: number } = {}) {
  return executeContentQuery("projects.list", () => prisma.project.findMany({
    where: { ...publicProjectWhere, ...(options.featured === undefined ? {} : { featured: options.featured }) },
    orderBy: { order: "asc" },
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
    prisma.project.findFirst({ where: { ...publicProjectWhere, slug } }),
  )
}

export function getPublicProjectBySlug(slug: string) {
  return unstable_cache(
    () => queryPublicProjectBySlug(slug),
    ["public-project", slug],
    { tags: [contentTags.projects, contentTags.project(slug)], revalidate: 3600 },
  )()
}

export async function getPublicProjectSitemapEntries() {
  return executeContentQuery("projects.sitemap", () => prisma.project.findMany({
    where: publicProjectWhere,
    select: { slug: true, updatedAt: true },
  }))
}
