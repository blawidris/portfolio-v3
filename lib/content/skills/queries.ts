import "server-only"

import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import { contentTags } from "@/lib/content/cache"
import { visibleWhere } from "@/lib/content/publication"
import { executeContentQuery } from "@/lib/content/query"

export const getVisibleSkillCategories = unstable_cache(
  () => executeContentQuery(
    "skills.list",
    () => prisma.skillCategory.findMany({
      where: visibleWhere,
      orderBy: { order: "asc" },
      include: { skills: { where: visibleWhere, orderBy: { order: "asc" } } },
    }),
  ),
  ["visible-skill-categories"],
  { tags: [contentTags.skills], revalidate: 3600 },
)
