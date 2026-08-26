import { beforeEach, describe, expect, it, vi } from "vitest"

const { auth, findUnique, findMany, create, update, destroy } = vi.hoisted(() => ({
  auth: vi.fn(),
  findUnique: vi.fn(),
  findMany: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  destroy: vi.fn(),
}))

vi.mock("@/auth", () => ({ auth }))
vi.mock("@/lib/prisma", () => ({
  prisma: { caseStudy: { findUnique, findMany, create, update, delete: destroy } },
}))
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }))

import { GET as listCaseStudies, POST as createCaseStudy } from "@/app/api/admin/case-studies/route"
import { PATCH as updateCaseStudy, DELETE as deleteCaseStudy } from "@/app/api/admin/case-studies/[id]/route"
import { POST as regenerateToken } from "@/app/api/admin/case-studies/[id]/preview-token/route"

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/admin/case-studies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

function params(id: string) {
  return { params: Promise.resolve({ id }) }
}

const validPayload = {
  title: "How We Cut Latency 40%",
  slug: "how-we-cut-latency-40",
  summary: "A deep dive into a caching redesign.",
  content: "## Background\n\nDetails.",
  published: true,
}

beforeEach(() => {
  vi.clearAllMocks()
  auth.mockResolvedValue({ user: { email: "admin@example.com" } })
})

describe("GET /api/admin/case-studies", () => {
  it("rejects an unauthenticated request", async () => {
    auth.mockResolvedValue(null)
    const res = await listCaseStudies()
    expect(res.status).toBe(401)
  })
})

describe("POST /api/admin/case-studies", () => {
  it("rejects an unauthenticated request", async () => {
    auth.mockResolvedValue(null)
    const res = await createCaseStudy(jsonRequest(validPayload))
    expect(res.status).toBe(401)
    expect(create).not.toHaveBeenCalled()
  })

  it("rejects invalid input", async () => {
    const res = await createCaseStudy(jsonRequest({ ...validPayload, slug: "Not A Slug" }))
    expect(res.status).toBe(422)
    expect(create).not.toHaveBeenCalled()
  })

  it("accepts a valid case study, standalone by default", async () => {
    create.mockResolvedValue({ id: "1", ...validPayload, projectId: null })
    const res = await createCaseStudy(jsonRequest(validPayload))
    expect(res.status).toBe(201)
    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ title: validPayload.title, projectId: undefined }),
    }))
  })

  it("accepts a case study linked to a project", async () => {
    create.mockResolvedValue({ id: "1", ...validPayload, projectId: "project-1" })
    const res = await createCaseStudy(jsonRequest({ ...validPayload, projectId: "project-1" }))
    expect(res.status).toBe(201)
    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ projectId: "project-1" }),
    }))
  })
})

describe("PATCH /api/admin/case-studies/[id]", () => {
  it("rejects an unauthenticated request", async () => {
    auth.mockResolvedValue(null)
    const res = await updateCaseStudy(jsonRequest({ title: "New" }), params("1"))
    expect(res.status).toBe(401)
    expect(update).not.toHaveBeenCalled()
  })

  it("returns 404 for an unknown case study", async () => {
    findUnique.mockResolvedValue(null)
    const res = await updateCaseStudy(jsonRequest({ title: "New" }), params("missing"))
    expect(res.status).toBe(404)
  })

  it("updates only the supplied fields", async () => {
    findUnique.mockResolvedValue({ slug: "old-slug" })
    update.mockResolvedValue({ id: "1", slug: "old-slug", title: "New" })
    const res = await updateCaseStudy(jsonRequest({ title: "New" }), params("1"))
    expect(res.status).toBe(200)
    expect(update).toHaveBeenCalledWith({ where: { id: "1" }, data: { title: "New" } })
  })
})

describe("DELETE /api/admin/case-studies/[id]", () => {
  it("rejects an unauthenticated request", async () => {
    auth.mockResolvedValue(null)
    const res = await deleteCaseStudy(new Request("http://localhost/x"), params("1"))
    expect(res.status).toBe(401)
  })

  it("returns 404 for an unknown case study", async () => {
    findUnique.mockResolvedValue(null)
    const res = await deleteCaseStudy(new Request("http://localhost/x"), params("missing"))
    expect(res.status).toBe(404)
  })

  it("deletes when authenticated", async () => {
    findUnique.mockResolvedValue({ slug: "some-slug" })
    destroy.mockResolvedValue({})
    const res = await deleteCaseStudy(new Request("http://localhost/x"), params("1"))
    expect(res.status).toBe(204)
  })
})

describe("POST /api/admin/case-studies/[id]/preview-token", () => {
  it("rejects an unauthenticated request", async () => {
    auth.mockResolvedValue(null)
    const res = await regenerateToken(new Request("http://localhost/x"), params("1"))
    expect(res.status).toBe(401)
  })

  it("returns 404 for an unknown case study", async () => {
    findUnique.mockResolvedValue(null)
    const res = await regenerateToken(new Request("http://localhost/x"), params("missing"))
    expect(res.status).toBe(404)
  })

  it("generates and persists a new random token", async () => {
    findUnique.mockResolvedValue({ id: "1" })
    update.mockResolvedValue({})
    const res = await regenerateToken(new Request("http://localhost/x"), params("1"))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.previewToken).toMatch(/^[0-9a-f]{48}$/)
    expect(update).toHaveBeenCalledWith({ where: { id: "1" }, data: { previewToken: body.previewToken } })
  })

  it("generates a different token on each call", async () => {
    findUnique.mockResolvedValue({ id: "1" })
    update.mockResolvedValue({})
    const first = await (await regenerateToken(new Request("http://localhost/x"), params("1"))).json()
    const second = await (await regenerateToken(new Request("http://localhost/x"), params("1"))).json()
    expect(first.previewToken).not.toBe(second.previewToken)
  })
})
