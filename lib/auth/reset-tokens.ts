import "server-only"

import { randomBytes, createHash } from "node:crypto"
import type { Admin } from "@prisma/client"
import { prisma } from "@/lib/prisma"

const TOKEN_TTL_MS = 60 * 60 * 1000
const REISSUE_COOLDOWN_MS = 5 * 60 * 1000

function hashToken(rawToken: string) {
  return createHash("sha256").update(rawToken).digest("hex")
}

// Refuses a new token while a recently-issued one is still outstanding, so a
// public "forgot password" form can't be used to spam an admin's inbox.
export async function canIssueResetToken(adminId: string): Promise<boolean> {
  const mostRecent = await prisma.passwordResetToken.findFirst({
    where: { adminId },
    orderBy: { createdAt: "desc" },
  })

  if (!mostRecent) return true
  return Date.now() - mostRecent.createdAt.getTime() >= REISSUE_COOLDOWN_MS
}

// Returns the raw token (only this call ever sees it — only its SHA-256 hash
// is persisted). Invalidates any other outstanding tokens for this admin so
// at most one reset link is ever valid at a time.
export async function createResetToken(adminId: string): Promise<string> {
  const rawToken = randomBytes(32).toString("hex")

  await prisma.$transaction([
    prisma.passwordResetToken.updateMany({
      where: { adminId, usedAt: null },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.create({
      data: {
        adminId,
        tokenHash: hashToken(rawToken),
        expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      },
    }),
  ])

  return rawToken
}

// Validates and marks a reset token used in one step, returning the admin it
// belongs to (or null for any invalid/expired/already-used/unknown token).
export async function consumeResetToken(rawToken: string): Promise<Admin | null> {
  const tokenHash = hashToken(rawToken)
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { admin: true },
  })

  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) return null

  await prisma.passwordResetToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  })

  return record.admin
}
