import "server-only"

import bcrypt from "bcryptjs"

const SALT_ROUNDS = 12

// bcrypt silently truncates input at 72 bytes. Irrelevant at the 12-character
// minimum enforced by lib/validation/auth.ts, but worth noting for future readers.
export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
