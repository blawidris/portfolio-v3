import "server-only"

import type { Admin } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { verifyPassword } from "@/lib/auth/password"

const LOCKOUT_THRESHOLD = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000

// Deliberately returns null for every failure case (wrong email, wrong
// password, inactive account, locked account) so auth.ts's authorize()
// can show one generic "Invalid email or password" message and never
// confirm which part was wrong.
export async function verifyAdminCredentials(email: unknown, password: unknown): Promise<Admin | null> {
  if (typeof email !== "string" || typeof password !== "string") return null

  const normalizedEmail = email.trim().toLowerCase()
  const admin = await prisma.admin.findUnique({ where: { email: normalizedEmail } })
  if (!admin || !admin.isActive) return null

  if (admin.lockedUntil && admin.lockedUntil.getTime() > Date.now()) return null

  const passwordMatches = await verifyPassword(password, admin.passwordHash)
  if (!passwordMatches) {
    await recordFailedLogin(admin)
    return null
  }

  await prisma.admin.update({
    where: { id: admin.id },
    data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
  })

  return admin
}

async function recordFailedLogin(admin: Admin) {
  const attempts = admin.failedLoginAttempts + 1
  const shouldLock = attempts >= LOCKOUT_THRESHOLD

  await prisma.admin.update({
    where: { id: admin.id },
    data: {
      failedLoginAttempts: shouldLock ? 0 : attempts,
      lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_DURATION_MS) : admin.lockedUntil,
    },
  })
}
