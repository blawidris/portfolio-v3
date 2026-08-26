import "server-only"

import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import { contentTags } from "@/lib/content/cache"
import { publishedPostWhere } from "@/lib/content/publication"
import { executeContentQuery } from "@/lib/content/query"

export async function queryPublishedPosts(options: { take?: number } = {}) {
  return executeContentQuery("articles.list", () => prisma.post.findMany({
    where: publishedPostWhere,
    orderBy: { createdAt: "desc" },
    ...(options.take ? { take: options.take } : {}),
  }))
}

export function getPublishedPosts(options: { take?: number } = {}) {
  const take = options.take
  return unstable_cache(
    () => queryPublishedPosts({ take }),
    ["published-posts", String(take ?? "all")],
    { tags: [contentTags.articles], revalidate: 3600 },
  )()
}

export async function queryPublishedPostBySlug(slug: string) {
  return executeContentQuery("articles.detail", () =>
    prisma.post.findFirst({ where: { ...publishedPostWhere, slug } }),
  )
}

export function getPublishedPostBySlug(slug: string) {
  return unstable_cache(
    () => queryPublishedPostBySlug(slug),
    ["published-post", slug],
    { tags: [contentTags.articles, contentTags.article(slug)], revalidate: 3600 },
  )()
}

export async function getPublishedPostSitemapEntries() {
  return executeContentQuery("articles.sitemap", () => prisma.post.findMany({
    where: publishedPostWhere,
    select: { slug: true, updatedAt: true },
  }))
}
