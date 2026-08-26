import { describe, expect, it } from "vitest"
import { footerLinkInputSchema } from "@/lib/validation/footer-links"
import { postInputSchema } from "@/lib/validation/posts"
import { projectInputSchema, projectUpdateSchema } from "@/lib/validation/projects"
import { experienceUpdateSchema } from "@/lib/validation/experience"

const validProject = {
  title: "Project",
  slug: "project",
  description: "Description",
  content: "## Case study",
  type: "web",
  status: "live",
  year: 2026,
  stack: ["Next.js", "Next.js"],
  featured: true,
  order: 0,
  published: true,
}

describe("administrator validation", () => {
  it("normalizes a valid project and applies the existing category default", () => {
    const result = projectInputSchema.parse(validProject)
    expect(result.category).toBe("side-project")
    expect(result.stack).toEqual(["Next.js"])
  })

  it("rejects invalid project slugs and unknown fields", () => {
    expect(projectInputSchema.safeParse({ ...validProject, slug: "Not Valid" }).success).toBe(false)
    expect(projectInputSchema.safeParse({ ...validProject, privateFlag: true }).success).toBe(false)
  })

  it("tightens type and status to the real values already in use", () => {
    expect(projectInputSchema.safeParse({ ...validProject, type: "desktop" }).success).toBe(false)
    expect(projectInputSchema.safeParse({ ...validProject, status: "planned" }).success).toBe(false)
    expect(projectInputSchema.safeParse({ ...validProject, type: "mobile", status: "archived" }).success).toBe(true)
  })

  it("accepts valid post data and rejects incomplete data", () => {
    const post = {
      title: "Article",
      slug: "article",
      description: "Description",
      content: "Content",
      tags: ["Architecture"],
      readingTime: "5 min read",
      published: false,
    }
    expect(postInputSchema.safeParse(post).success).toBe(true)
    expect(postInputSchema.safeParse({ ...post, title: "" }).success).toBe(false)
  })

  it("allows safe footer protocols and rejects javascript URLs", () => {
    expect(footerLinkInputSchema.safeParse({ label: "Email", url: "mailto:test@example.com", icon: "Mail", order: 0 }).success).toBe(true)
    expect(footerLinkInputSchema.safeParse({ label: "Bad", url: "javascript:alert(1)", icon: "Link", order: 0 }).success).toBe(false)
  })

  // Regression test: .partial() does not strip .default() in Zod, so an
  // update schema built directly from a defaulted create schema would
  // silently reapply that default to every omitted field on every PATCH —
  // e.g. renaming a "work" project without repeating category would have
  // silently reset it to "side-project". Update schemas must be built from
  // an undefaulted shape instead (see lib/validation/projects.ts).
  it("does not silently reapply create-schema defaults on a partial update", () => {
    const project = projectUpdateSchema.parse({ title: "Renamed" })
    expect(project).toEqual({ title: "Renamed" })
    expect(project).not.toHaveProperty("category")

    const experience = experienceUpdateSchema.parse({ role: "New role" })
    expect(experience).toEqual({ role: "New role" })
    expect(experience).not.toHaveProperty("visible")
    expect(experience).not.toHaveProperty("isCurrent")
    expect(experience).not.toHaveProperty("order")
  })
})
