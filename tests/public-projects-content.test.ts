import { beforeEach, describe, expect, it, vi } from "vitest"

const { projectFindMany, projectFindFirst, caseStudyFindMany, caseStudyFindFirst } = vi.hoisted(() => ({
  projectFindMany: vi.fn(),
  projectFindFirst: vi.fn(),
  caseStudyFindMany: vi.fn(),
  caseStudyFindFirst: vi.fn(),
}))

vi.mock("server-only", () => ({}))
vi.mock("next/cache", () => ({
  unstable_cache: (callback: () => unknown) => callback,
  revalidateTag: vi.fn(),
}))
vi.mock("@/lib/prisma", () => ({
  prisma: {
    project: { findMany: projectFindMany, findFirst: projectFindFirst },
    caseStudy: { findMany: caseStudyFindMany, findFirst: caseStudyFindFirst },
  },
}))

import { queryPublicProjects, queryPublicProjectBySlug, getProjectPreview } from "@/lib/content/projects/queries"
import { getPublicCaseStudyBySlug, getCaseStudyPreview } from "@/lib/content/case-studies/queries"

beforeEach(() => {
  vi.clearAllMocks()
  projectFindMany.mockResolvedValue([])
  projectFindFirst.mockResolvedValue(null)
  caseStudyFindMany.mockResolvedValue([])
  caseStudyFindFirst.mockResolvedValue(null)
})

describe("public project queries", () => {
  it("filters the project list to published records only", async () => {
    await queryPublicProjects()
    expect(projectFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ published: true }),
    }))
  })

  it("filters a project detail lookup to published records only", async () => {
    await queryPublicProjectBySlug("some-project")
    expect(projectFindFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ published: true, slug: "some-project" }),
    }))
  })

  it("the preview lookup matches on slug and token without filtering on published", async () => {
    await getProjectPreview("draft-project", "abc123")
    expect(projectFindFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { slug: "draft-project", previewToken: "abc123" },
    }))
  })

  it("the preview lookup returns null instead of querying when no token is supplied", async () => {
    const result = await getProjectPreview("draft-project", "")
    expect(result).toBeNull()
    expect(projectFindFirst).not.toHaveBeenCalled()
  })
})

describe("public case study queries", () => {
  it("filters a case study detail lookup to published records only", async () => {
    await getPublicCaseStudyBySlug("some-case-study")
    expect(caseStudyFindFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ published: true, slug: "some-case-study" }),
    }))
  })

  it("the preview lookup matches on slug and token without filtering on published", async () => {
    await getCaseStudyPreview("draft-case-study", "xyz789")
    expect(caseStudyFindFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { slug: "draft-case-study", previewToken: "xyz789" },
    }))
  })

  it("the preview lookup returns null instead of querying when no token is supplied", async () => {
    const result = await getCaseStudyPreview("draft-case-study", "")
    expect(result).toBeNull()
    expect(caseStudyFindFirst).not.toHaveBeenCalled()
  })
})
