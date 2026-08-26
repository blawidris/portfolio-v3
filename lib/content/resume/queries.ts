import "server-only"

import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import { contentTags } from "@/lib/content/cache"
import { activeResumeWhere } from "@/lib/content/publication"
import { executeContentQuery } from "@/lib/content/query"

export const getActiveResume = unstable_cache(
  () => executeContentQuery(
    "resume.active",
    () => prisma.resume.findFirst({ where: activeResumeWhere, include: { media: true } }),
  ),
  ["active-resume"],
  { tags: [contentTags.resume], revalidate: 3600 },
)
