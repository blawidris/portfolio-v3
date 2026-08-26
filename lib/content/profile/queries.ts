import "server-only"

import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import { contentTags } from "@/lib/content/cache"
import { executeContentQuery } from "@/lib/content/query"

export const getProfile = unstable_cache(
  () => executeContentQuery(
    "profile.get",
    () => prisma.profile.findUnique({ where: { id: "profile" } }),
  ),
  ["profile"],
  { tags: [contentTags.profile], revalidate: 3600 },
)
