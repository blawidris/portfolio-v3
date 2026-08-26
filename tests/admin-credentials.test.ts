import { beforeEach, describe, expect, it, vi } from "vitest"

const { adminFindUnique, adminUpdate, verifyPassword } = vi.hoisted(() => ({
  adminFindUnique: vi.fn(),
  adminUpdate: vi.fn(),
  verifyPassword: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: { admin: { findUnique: adminFindUnique, update: adminUpdate } },
}))
vi.mock("@/lib/auth/password", () => ({ verifyPassword }))

import { verifyAdminCredentials } from "@/lib/auth/credentials"

const baseAdmin = {
  id: "admin-1",
  email: "admin@example.com",
  name: "Admin",
  passwordHash: "hashed",
  isActive: true,
  failedLoginAttempts: 0,
  lockedUntil: null,
  lastLoginAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe("verifyAdminCredentials", () => {
  beforeEach(() => {
    adminFindUnique.mockReset()
    adminUpdate.mockReset()
    verifyPassword.mockReset()
    adminUpdate.mockResolvedValue(baseAdmin)
  })

  it("returns null for non-string input", async () => {
    expect(await verifyAdminCredentials(undefined, "x")).toBeNull()
    expect(await verifyAdminCredentials("a@b.com", undefined)).toBeNull()
    expect(adminFindUnique).not.toHaveBeenCalled()
  })

  it("returns the admin and resets attempts on correct credentials", async () => {
    adminFindUnique.mockResolvedValue(baseAdmin)
    verifyPassword.mockResolvedValue(true)

    const result = await verifyAdminCredentials("admin@example.com", "correct-password")

    expect(result).toEqual(baseAdmin)
    expect(adminUpdate).toHaveBeenCalledWith({
      where: { id: baseAdmin.id },
      data: expect.objectContaining({ failedLoginAttempts: 0, lockedUntil: null }),
    })
  })

  it("returns null and increments attempts on wrong password", async () => {
    adminFindUnique.mockResolvedValue({ ...baseAdmin, failedLoginAttempts: 1 })
    verifyPassword.mockResolvedValue(false)

    const result = await verifyAdminCredentials("admin@example.com", "wrong-password")

    expect(result).toBeNull()
    expect(adminUpdate).toHaveBeenCalledWith({
      where: { id: baseAdmin.id },
      data: { failedLoginAttempts: 2, lockedUntil: null },
    })
  })

  it("locks the account on the 5th consecutive failed attempt", async () => {
    adminFindUnique.mockResolvedValue({ ...baseAdmin, failedLoginAttempts: 4 })
    verifyPassword.mockResolvedValue(false)

    await verifyAdminCredentials("admin@example.com", "wrong-password")

    expect(adminUpdate).toHaveBeenCalledWith({
      where: { id: baseAdmin.id },
      data: { failedLoginAttempts: 0, lockedUntil: expect.any(Date) },
    })
  })

  it("rejects a correct password while the account is locked", async () => {
    const future = new Date(Date.now() + 10 * 60 * 1000)
    adminFindUnique.mockResolvedValue({ ...baseAdmin, lockedUntil: future })
    verifyPassword.mockResolvedValue(true)

    const result = await verifyAdminCredentials("admin@example.com", "correct-password")

    expect(result).toBeNull()
    expect(verifyPassword).not.toHaveBeenCalled()
  })

  it("allows login again once the lockout window has passed", async () => {
    const past = new Date(Date.now() - 1000)
    adminFindUnique.mockResolvedValue({ ...baseAdmin, lockedUntil: past })
    verifyPassword.mockResolvedValue(true)

    const result = await verifyAdminCredentials("admin@example.com", "correct-password")

    expect(result).toEqual({ ...baseAdmin, lockedUntil: past })
  })

  it("returns null for an inactive admin", async () => {
    adminFindUnique.mockResolvedValue({ ...baseAdmin, isActive: false })

    const result = await verifyAdminCredentials("admin@example.com", "correct-password")

    expect(result).toBeNull()
    expect(verifyPassword).not.toHaveBeenCalled()
  })

  it("returns null for an unknown email", async () => {
    adminFindUnique.mockResolvedValue(null)

    const result = await verifyAdminCredentials("nobody@example.com", "anything")

    expect(result).toBeNull()
  })
})
