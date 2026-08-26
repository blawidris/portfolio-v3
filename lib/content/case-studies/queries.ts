import "server-only"

import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import { contentTags } from "@/lib/content/cache"
import { publicCaseStudyWhere } from "@/lib/content/publication"
import { executeContentQuery } from "@/lib/content/query"

export const getPublicCaseStudies = unstable_cache(
  () => executeContentQuery(
    "case-studies.list",
    () => prisma.caseStudy.findMany({
      where: publicCaseStudyWhere,
      orderBy: { order: "asc" },
      include: { coverMedia: true },
    }),
  ),
  ["public-case-studies"],
  { tags: [contentTags.caseStudies], revalidate: 3600 },
)

export function getPublicCaseStudyBySlug(slug: string) {
  return unstable_cache(
    () => executeContentQuery(
      "case-studies.detail",
      () => prisma.caseStudy.findFirst({
        where: { ...publicCaseStudyWhere, slug },
        include: { coverMedia: true, project: true },
      }),
    ),
    ["public-case-study", slug],
    { tags: [contentTags.caseStudies, contentTags.caseStudy(slug)], revalidate: 3600 },
  )()
}

// Deliberately uncached — see lib/content/projects/queries.ts's
// getProjectPreview for why draft content must never be cached.
export async function getCaseStudyPreview(slug: string, token: string) {
  if (!token) return null
  return executeContentQuery("case-studies.preview", () =>
    prisma.caseStudy.findFirst({ where: { slug, previewToken: token }, include: { coverMedia: true, project: true } }),
  )
}

export async function getPublicCaseStudySitemapEntries() {
  return executeContentQuery("case-studies.sitemap", () => prisma.caseStudy.findMany({
    where: publicCaseStudyWhere,
    select: { slug: true, updatedAt: true },
  }))
}
