import { beforeEach, describe, expect, it, vi } from "vitest"

const { postFindMany, postFindFirst } = vi.hoisted(() => ({
  postFindMany: vi.fn(),
  postFindFirst: vi.fn(),
}))

vi.mock("server-only", () => ({}))
vi.mock("next/cache", () => ({
  unstable_cache: (callback: () => unknown) => callback,
  revalidateTag: vi.fn(),
}))
vi.mock("@/lib/prisma", () => ({
  prisma: { post: { findMany: postFindMany, findFirst: postFindFirst } },
}))

import { queryPublishedPostBySlug, queryPublishedPosts } from "@/lib/content/articles/queries"

describe("article publication policy", () => {
  beforeEach(() => {
    postFindMany.mockResolvedValue([])
    postFindFirst.mockResolvedValue(null)
  })

  it("filters public article lists to published records", async () => {
    await queryPublishedPosts()
    expect(postFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: { published: true } }))
  })

  it("filters public article details to a published slug", async () => {
    await queryPublishedPostBySlug("draft-article")
    expect(postFindFirst).toHaveBeenCalledWith({ where: { published: true, slug: "draft-article" } })
  })
})
