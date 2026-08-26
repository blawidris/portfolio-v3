import "server-only"

import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import { contentTags } from "@/lib/content/cache"
import { visibleWhere } from "@/lib/content/publication"
import { executeContentQuery } from "@/lib/content/query"

export const getVisibleExperience = unstable_cache(
  () => executeContentQuery(
    "experience.list",
    () => prisma.experience.findMany({ where: visibleWhere, orderBy: { order: "asc" } }),
  ),
  ["visible-experience"],
  { tags: [contentTags.experience], revalidate: 3600 },
)
