import { beforeEach, describe, expect, it, vi } from "vitest"
import { Prisma } from "@prisma/client"

const { auth, projectCreate, postCreate } = vi.hoisted(() => ({
  auth: vi.fn(),
  projectCreate: vi.fn(),
  postCreate: vi.fn(),
}))

vi.mock("@/auth", () => ({ auth }))
vi.mock("@/lib/prisma", () => ({
  prisma: {
    project: { create: projectCreate, findMany: vi.fn() },
    post: { create: postCreate, findMany: vi.fn() },
  },
}))
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }))

import { POST as createProject } from "@/app/api/admin/projects/route"
import { POST as createPost } from "@/app/api/admin/posts/route"

const projectPayload = {
  title: "Project",
  slug: "project",
  description: "Description",
  content: "Content",
  type: "web",
  status: "live",
  year: 2026,
  stack: ["Next.js"],
  featured: false,
  order: 0,
  published: true,
}

const postPayload = {
  title: "Article",
  slug: "article",
  description: "Description",
  content: "Content",
  tags: ["Architecture"],
  readingTime: "5 min read",
  published: true,
}

function jsonRequest(url: string, body: unknown) {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("administrator mutation boundaries", () => {
  beforeEach(() => {
    auth.mockResolvedValue({ user: { email: "admin@example.com" } })
    projectCreate.mockResolvedValue({ id: "project-id", category: "side-project", ...projectPayload })
    postCreate.mockResolvedValue({ id: "post-id", ...postPayload })
  })

  it("rejects an unauthenticated mutation", async () => {
    auth.mockResolvedValue(null)
    const response = await createProject(jsonRequest("http://localhost/api/admin/projects", projectPayload))
    expect(response.status).toBe(401)
    expect(projectCreate).not.toHaveBeenCalled()
  })

  it("accepts and allow-lists a valid project mutation", async () => {
    const response = await createProject(jsonRequest("http://localhost/api/admin/projects", projectPayload))
    expect(response.status).toBe(201)
    expect(projectCreate).toHaveBeenCalledWith({ data: { category: "side-project", ...projectPayload } })
  })

  it("rejects an invalid project mutation", async () => {
    const response = await createProject(jsonRequest("http://localhost/api/admin/projects", { ...projectPayload, slug: "INVALID SLUG" }))
    expect(response.status).toBe(422)
    expect((await response.json()).error.code).toBe("VALIDATION_ERROR")
    expect(projectCreate).not.toHaveBeenCalled()
  })

  it("accepts a valid article mutation", async () => {
    const response = await createPost(jsonRequest("http://localhost/api/admin/posts", postPayload))
    expect(response.status).toBe(201)
    expect(postCreate).toHaveBeenCalledWith({ data: postPayload })
  })

  it("rejects an invalid article mutation", async () => {
    const response = await createPost(jsonRequest("http://localhost/api/admin/posts", { ...postPayload, title: "" }))
    expect(response.status).toBe(422)
    expect(postCreate).not.toHaveBeenCalled()
  })

  it("maps a unique slug conflict to HTTP 409", async () => {
    projectCreate.mockRejectedValue(new Prisma.PrismaClientKnownRequestError("Unique constraint", {
      code: "P2002",
      clientVersion: "5.22.0",
    }))
    const response = await createProject(jsonRequest("http://localhost/api/admin/projects", projectPayload))
    expect(response.status).toBe(409)
    expect((await response.json()).error.code).toBe("CONFLICT")
  })
})
