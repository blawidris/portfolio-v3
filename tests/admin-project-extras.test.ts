import { beforeEach, describe, expect, it, vi } from "vitest"

const { auth, mockPrisma } = vi.hoisted(() => {
  const modelMock = () => ({ create: vi.fn(), delete: vi.fn(), findUnique: vi.fn() })
  return {
    auth: vi.fn(),
    mockPrisma: {
      projectImage: modelMock(),
      projectChallenge: modelMock(),
      projectMetric: modelMock(),
      project: { findUnique: vi.fn() },
    },
  }
})

vi.mock("@/auth", () => ({ auth }))
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }))
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }))

import { POST as createImage } from "@/app/api/admin/project-images/route"
import { DELETE as deleteImage } from "@/app/api/admin/project-images/[id]/route"
import { POST as createChallenge } from "@/app/api/admin/project-challenges/route"
import { DELETE as deleteChallenge } from "@/app/api/admin/project-challenges/[id]/route"
import { POST as createMetric } from "@/app/api/admin/project-metrics/route"
import { DELETE as deleteMetric } from "@/app/api/admin/project-metrics/[id]/route"

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/admin/x", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

function params(id: string) {
  return { params: Promise.resolve({ id }) }
}

const resources = [
  {
    name: "project-images",
    model: mockPrisma.projectImage,
    create: createImage,
    delete: deleteImage,
    valid: { projectId: "project-1", mediaId: "media-1" },
    invalid: { projectId: "project-1", mediaId: "media-1", role: "hero" },
  },
  {
    name: "project-challenges",
    model: mockPrisma.projectChallenge,
    create: createChallenge,
    delete: deleteChallenge,
    valid: { projectId: "project-1", title: "Scaling writes", description: "Sharded the write path." },
    invalid: { projectId: "project-1", title: "", description: "x" },
  },
  {
    name: "project-metrics",
    model: mockPrisma.projectMetric,
    create: createMetric,
    delete: deleteMetric,
    valid: { projectId: "project-1", label: "Latency", value: "-40%" },
    invalid: { projectId: "project-1", label: "", value: "-40%" },
  },
]

beforeEach(() => {
  vi.clearAllMocks()
  auth.mockResolvedValue({ user: { email: "admin@example.com" } })
  mockPrisma.project.findUnique.mockResolvedValue({ slug: "project-slug" })
})

describe.each(resources)("$name admin routes", ({ model, create, delete: destroy, valid, invalid }) => {
  it("rejects an unauthenticated create", async () => {
    auth.mockResolvedValue(null)
    const res = await create(jsonRequest(valid))
    expect(res.status).toBe(401)
    expect(model.create).not.toHaveBeenCalled()
  })

  it("rejects invalid input on create", async () => {
    const res = await create(jsonRequest(invalid))
    expect(res.status).toBe(422)
    expect(model.create).not.toHaveBeenCalled()
  })

  it("accepts a valid create", async () => {
    model.create.mockResolvedValue({ id: "1", ...valid })
    const res = await create(jsonRequest(valid))
    expect(res.status).toBe(201)
    expect(model.create).toHaveBeenCalled()
  })

  it("rejects an unauthenticated delete", async () => {
    auth.mockResolvedValue(null)
    const res = await destroy(new Request("http://localhost/x"), params("1"))
    expect(res.status).toBe(401)
    expect(model.delete).not.toHaveBeenCalled()
  })

  it("returns 404 deleting an unknown record", async () => {
    model.findUnique.mockResolvedValue(null)
    const res = await destroy(new Request("http://localhost/x"), params("missing"))
    expect(res.status).toBe(404)
    expect(model.delete).not.toHaveBeenCalled()
  })

  it("deletes and revalidates the owning project when authenticated", async () => {
    model.findUnique.mockResolvedValue({ id: "1", project: { slug: "project-slug" } })
    model.delete.mockResolvedValue({})
    const res = await destroy(new Request("http://localhost/x"), params("1"))
    expect(res.status).toBe(204)
    expect(model.delete).toHaveBeenCalledWith({ where: { id: "1" } })
  })
})
