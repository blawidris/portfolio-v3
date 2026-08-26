import { beforeEach, describe, expect, it, vi } from "vitest"

const {
  auth,
  adminFindUnique,
  adminUpdate,
  tokenFindFirst,
  tokenFindUnique,
  tokenUpdate,
  tokenUpdateMany,
  tokenCreate,
  transaction,
  sendPasswordResetEmail,
  hashPassword,
  verifyPassword,
  logServerError,
} = vi.hoisted(() => ({
  auth: vi.fn(),
  adminFindUnique: vi.fn(),
  adminUpdate: vi.fn(),
  tokenFindFirst: vi.fn(),
  tokenFindUnique: vi.fn(),
  tokenUpdate: vi.fn(),
  tokenUpdateMany: vi.fn(),
  tokenCreate: vi.fn(),
  transaction: vi.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
  sendPasswordResetEmail: vi.fn(),
  hashPassword: vi.fn(),
  verifyPassword: vi.fn(),
  logServerError: vi.fn(),
}))

vi.mock("@/auth", () => ({ auth }))
vi.mock("@/lib/prisma", () => ({
  prisma: {
    admin: { findUnique: adminFindUnique, update: adminUpdate },
    passwordResetToken: {
      findFirst: tokenFindFirst,
      findUnique: tokenFindUnique,
      update: tokenUpdate,
      updateMany: tokenUpdateMany,
      create: tokenCreate,
    },
    $transaction: transaction,
  },
}))
vi.mock("@/lib/email/resend", async () => {
  const actual = await vi.importActual<typeof import("@/lib/email/resend")>("@/lib/email/resend")
  return { ...actual, sendPasswordResetEmail }
})
vi.mock("@/lib/auth/password", () => ({ hashPassword, verifyPassword }))
vi.mock("@/lib/logger", () => ({ logServerError }))

import { POST as forgotPassword } from "@/app/api/admin/auth/forgot-password/route"
import { POST as resetPassword } from "@/app/api/admin/auth/reset-password/route"
import { POST as changePassword } from "@/app/api/admin/auth/change-password/route"
import { EmailNotConfiguredError } from "@/lib/email/resend"

function jsonRequest(url: string, body: unknown) {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

const admin = {
  id: "admin-1",
  email: "admin@example.com",
  name: "Admin",
  passwordHash: "hashed",
  isActive: true,
  failedLoginAttempts: 3,
  lockedUntil: new Date(Date.now() + 10 * 60 * 1000),
  lastLoginAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

beforeEach(() => {
  vi.clearAllMocks()
  transaction.mockImplementation((ops: Promise<unknown>[]) => Promise.all(ops))
  tokenUpdateMany.mockResolvedValue({ count: 0 })
  tokenCreate.mockResolvedValue({ id: "token-1" })
})

describe("POST /api/admin/auth/forgot-password", () => {
  it("returns the same response whether the email exists or not", async () => {
    adminFindUnique.mockResolvedValueOnce(null)
    const notFoundRes = await forgotPassword(jsonRequest("http://localhost/x", { email: "nobody@example.com" }))
    const notFoundBody = await notFoundRes.json()

    adminFindUnique.mockResolvedValueOnce(admin)
    tokenFindFirst.mockResolvedValueOnce(null)
    const foundRes = await forgotPassword(jsonRequest("http://localhost/x", { email: admin.email }))
    const foundBody = await foundRes.json()

    expect(notFoundRes.status).toBe(200)
    expect(foundRes.status).toBe(200)
    expect(notFoundBody).toEqual(foundBody)
  })

  it("does not reissue a token within the cooldown window", async () => {
    adminFindUnique.mockResolvedValue(admin)
    tokenFindFirst.mockResolvedValue({ id: "recent", createdAt: new Date() })

    const res = await forgotPassword(jsonRequest("http://localhost/x", { email: admin.email }))

    expect(res.status).toBe(200)
    expect(tokenCreate).not.toHaveBeenCalled()
    expect(sendPasswordResetEmail).not.toHaveBeenCalled()
  })

  it("still returns success and logs when email delivery is unconfigured", async () => {
    adminFindUnique.mockResolvedValue(admin)
    tokenFindFirst.mockResolvedValue(null)
    sendPasswordResetEmail.mockRejectedValue(new EmailNotConfiguredError())

    const res = await forgotPassword(jsonRequest("http://localhost/x", { email: admin.email }))

    expect(res.status).toBe(200)
    expect(logServerError).toHaveBeenCalled()
  })

  it("rejects a malformed email with a validation error", async () => {
    const res = await forgotPassword(jsonRequest("http://localhost/x", { email: "not-an-email" }))
    expect(res.status).toBe(422)
    expect(adminFindUnique).not.toHaveBeenCalled()
  })
})

describe("POST /api/admin/auth/reset-password", () => {
  it("rejects a token that does not resolve to a record", async () => {
    tokenFindUnique.mockResolvedValue(null)
    const res = await resetPassword(jsonRequest("http://localhost/x", { token: "bad", password: "a-long-enough-password" }))
    expect(res.status).toBe(400)
    expect((await res.json()).error.code).toBe("INVALID_TOKEN")
  })

  it("rejects an already-used token", async () => {
    tokenFindUnique.mockResolvedValue({ id: "t1", usedAt: new Date(), expiresAt: new Date(Date.now() + 1000), admin })
    const res = await resetPassword(jsonRequest("http://localhost/x", { token: "used", password: "a-long-enough-password" }))
    expect(res.status).toBe(400)
  })

  it("rejects an expired token", async () => {
    tokenFindUnique.mockResolvedValue({ id: "t1", usedAt: null, expiresAt: new Date(Date.now() - 1000), admin })
    const res = await resetPassword(jsonRequest("http://localhost/x", { token: "expired", password: "a-long-enough-password" }))
    expect(res.status).toBe(400)
  })

  it("enforces the 12-character minimum before touching the database", async () => {
    const res = await resetPassword(jsonRequest("http://localhost/x", { token: "anything", password: "short" }))
    expect(res.status).toBe(422)
    expect(tokenFindUnique).not.toHaveBeenCalled()
  })

  it("accepts a valid token, updates the password, and clears lockout even if the account was locked", async () => {
    tokenFindUnique.mockResolvedValue({ id: "t1", usedAt: null, expiresAt: new Date(Date.now() + 1000), admin })
    tokenUpdate.mockResolvedValue({})
    hashPassword.mockResolvedValue("new-hash")
    adminUpdate.mockResolvedValue({})

    const res = await resetPassword(jsonRequest("http://localhost/x", { token: "good", password: "a-long-enough-password" }))

    expect(res.status).toBe(200)
    expect(adminUpdate).toHaveBeenCalledWith({
      where: { id: admin.id },
      data: { passwordHash: "new-hash", failedLoginAttempts: 0, lockedUntil: null },
    })
  })
})

describe("POST /api/admin/auth/change-password", () => {
  it("rejects an unauthenticated request", async () => {
    auth.mockResolvedValue(null)
    const res = await changePassword(jsonRequest("http://localhost/x", { currentPassword: "a", newPassword: "a-long-enough-password" }))
    expect(res.status).toBe(401)
  })

  it("rejects an incorrect current password", async () => {
    auth.mockResolvedValue({ user: { email: admin.email } })
    adminFindUnique.mockResolvedValue(admin)
    verifyPassword.mockResolvedValue(false)

    const res = await changePassword(jsonRequest("http://localhost/x", { currentPassword: "wrong", newPassword: "a-long-enough-password" }))

    expect(res.status).toBe(422)
    expect((await res.json()).error.fields.currentPassword).toBeDefined()
  })

  it("updates the password hash given the correct current password", async () => {
    auth.mockResolvedValue({ user: { email: admin.email } })
    adminFindUnique.mockResolvedValue(admin)
    verifyPassword.mockResolvedValue(true)
    hashPassword.mockResolvedValue("new-hash")
    adminUpdate.mockResolvedValue({})

    const res = await changePassword(jsonRequest("http://localhost/x", { currentPassword: "correct", newPassword: "a-long-enough-password" }))

    expect(res.status).toBe(200)
    expect(adminUpdate).toHaveBeenCalledWith({ where: { id: admin.id }, data: { passwordHash: "new-hash" } })
  })
})
