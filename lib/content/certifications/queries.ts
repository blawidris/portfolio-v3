import "server-only"

import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import { contentTags } from "@/lib/content/cache"
import { visibleWhere } from "@/lib/content/publication"
import { executeContentQuery } from "@/lib/content/query"

export const getVisibleCertifications = unstable_cache(
  () => executeContentQuery(
    "certifications.list",
    () => prisma.certification.findMany({
      where: visibleWhere,
      orderBy: { order: "asc" },
      include: { badgeMedia: true },
    }),
  ),
  ["visible-certifications"],
  { tags: [contentTags.certifications], revalidate: 3600 },
)
