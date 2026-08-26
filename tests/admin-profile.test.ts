import { beforeEach, describe, expect, it, vi } from "vitest"

const { auth, findUnique, update } = vi.hoisted(() => ({
  auth: vi.fn(),
  findUnique: vi.fn(),
  update: vi.fn(),
}))

vi.mock("@/auth", () => ({ auth }))
vi.mock("@/lib/prisma", () => ({ prisma: { profile: { findUnique, update } } }))
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }))

import { GET as getProfile, PATCH as updateProfile } from "@/app/api/admin/profile/route"

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/admin/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  auth.mockResolvedValue({ user: { email: "admin@example.com" } })
})

describe("GET /api/admin/profile", () => {
  it("rejects an unauthenticated request", async () => {
    auth.mockResolvedValue(null)
    const res = await getProfile()
    expect(res.status).toBe(401)
  })

  it("returns the singleton profile", async () => {
    findUnique.mockResolvedValue({ id: "profile", name: "Idris Lawal" })
    const res = await getProfile()
    expect(res.status).toBe(200)
    expect(findUnique).toHaveBeenCalledWith({ where: { id: "profile" } })
  })
})

describe("PATCH /api/admin/profile", () => {
  it("rejects an unauthenticated request", async () => {
    auth.mockResolvedValue(null)
    const res = await updateProfile(jsonRequest({ name: "New Name" }))
    expect(res.status).toBe(401)
    expect(update).not.toHaveBeenCalled()
  })

  it("rejects an update with no fields", async () => {
    const res = await updateProfile(jsonRequest({}))
    expect(res.status).toBe(422)
    expect(update).not.toHaveBeenCalled()
  })

  it("rejects an unknown field (strict schema)", async () => {
    const res = await updateProfile(jsonRequest({ name: "New Name", notAField: true }))
    expect(res.status).toBe(422)
    expect(update).not.toHaveBeenCalled()
  })

  it("updates only the supplied fields, targeting the singleton row", async () => {
    update.mockResolvedValue({ id: "profile", name: "New Name" })
    const res = await updateProfile(jsonRequest({ name: "New Name" }))
    expect(res.status).toBe(200)
    expect(update).toHaveBeenCalledWith({ where: { id: "profile" }, data: { name: "New Name" } })
  })

  it("maps a missing profile row to 404", async () => {
    const { Prisma } = await import("@prisma/client")
    update.mockRejectedValue(new Prisma.PrismaClientKnownRequestError("Not found", {
      code: "P2025",
      clientVersion: "5.22.0",
    }))
    const res = await updateProfile(jsonRequest({ name: "New Name" }))
    expect(res.status).toBe(404)
  })
})
