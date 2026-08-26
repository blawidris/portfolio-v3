import "server-only"

import { Resend } from "resend"
import { getServerEnvironment } from "@/lib/env"

export class EmailNotConfiguredError extends Error {
  constructor() {
    super("Email delivery is not configured (RESEND_API_KEY / RESEND_FROM_EMAIL missing).")
    this.name = "EmailNotConfiguredError"
  }
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const environment = getServerEnvironment()
  if (!environment.RESEND_API_KEY || !environment.RESEND_FROM_EMAIL) {
    throw new EmailNotConfiguredError()
  }

  const resend = new Resend(environment.RESEND_API_KEY)
  await resend.emails.send({
    from: environment.RESEND_FROM_EMAIL,
    to,
    subject: "Reset your admin password",
    html: `
      <p>A password reset was requested for your admin account.</p>
      <p><a href="${resetUrl}">Reset your password</a></p>
      <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
    `,
  })
}
