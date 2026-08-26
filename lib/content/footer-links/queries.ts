import "server-only"

import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import { contentTags } from "@/lib/content/cache"
import { executeContentQuery } from "@/lib/content/query"

export const getFooterLinks = unstable_cache(
  () => executeContentQuery(
    "footer-links.list",
    () => prisma.footerLink.findMany({ orderBy: { order: "asc" } }),
  ),
  ["footer-links"],
  { tags: [contentTags.footerLinks], revalidate: 3600 },
)
