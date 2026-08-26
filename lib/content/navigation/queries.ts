import "server-only"

import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import { contentTags } from "@/lib/content/cache"
import { visibleWhere } from "@/lib/content/publication"
import { executeContentQuery } from "@/lib/content/query"

export const getVisibleNavigationItems = unstable_cache(
  () => executeContentQuery(
    "navigation.list",
    () => prisma.navigationItem.findMany({ where: visibleWhere, orderBy: { order: "asc" } }),
  ),
  ["visible-navigation"],
  { tags: [contentTags.navigation], revalidate: 3600 },
)
