import { z } from "zod"

// .env files commonly ship empty-string placeholders (e.g. RESEND_API_KEY="").
// Treat "" the same as "unset" so an optional integration key doesn't fail
// validation just because it hasn't been filled in yet.
function optionalNonEmpty(schema: z.ZodString) {
  return z.preprocess((value) => (value === "" ? undefined : value), schema.optional())
}

const serverEnvironmentSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required."),
  DIRECT_URL: z.string().min(1, "DIRECT_URL is required."),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters."),
  NEXT_PUBLIC_SITE_URL: z.string().url("NEXT_PUBLIC_SITE_URL must be a valid absolute URL."),

  // Optional: password-reset email delivery. Absent until a Resend account
  // is configured — lib/email/resend.ts fails clearly at call time instead.
  RESEND_API_KEY: optionalNonEmpty(z.string().min(1, "RESEND_API_KEY must not be empty.")),
  RESEND_FROM_EMAIL: optionalNonEmpty(z.string().email("RESEND_FROM_EMAIL must be a valid email address.")),

  // Optional: Cloudflare R2 media storage. Absent until a bucket is
  // configured — lib/storage/r2.ts fails clearly at call time instead.
  R2_ACCOUNT_ID: optionalNonEmpty(z.string().min(1, "R2_ACCOUNT_ID must not be empty.")),
  R2_ACCESS_KEY_ID: optionalNonEmpty(z.string().min(1, "R2_ACCESS_KEY_ID must not be empty.")),
  R2_SECRET_ACCESS_KEY: optionalNonEmpty(z.string().min(1, "R2_SECRET_ACCESS_KEY must not be empty.")),
  R2_BUCKET_NAME: optionalNonEmpty(z.string().min(1, "R2_BUCKET_NAME must not be empty.")),
  R2_PUBLIC_URL: optionalNonEmpty(z.string().url("R2_PUBLIC_URL must be a valid absolute URL.")),
})

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>

export function parseServerEnvironment(environment: Record<string, string | undefined>): ServerEnvironment {
  const result = serverEnvironmentSchema.safeParse(environment)

  if (!result.success) {
    const variables = [...new Set(result.error.issues.map((issue) => String(issue.path[0])))]
    throw new Error(`Invalid server environment: ${variables.join(", ")}`)
  }

  return result.data
}

let cachedEnvironment: ServerEnvironment | undefined

export function getServerEnvironment(): ServerEnvironment {
  cachedEnvironment ??= parseServerEnvironment(process.env)
  return cachedEnvironment
}
