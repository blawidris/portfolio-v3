import { describe, expect, it } from "vitest"
import { parseServerEnvironment } from "@/lib/env"

const validEnvironment = {
  DATABASE_URL: "postgresql://portfolio:portfolio@localhost:5432/portfolio",
  DIRECT_URL: "postgresql://portfolio:portfolio@localhost:5432/portfolio",
  AUTH_SECRET: "a-secure-test-secret-that-is-long-enough",
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
}

describe("environment validation", () => {
  it("accepts a complete server environment", () => {
    expect(parseServerEnvironment(validEnvironment)).toMatchObject(validEnvironment)
  })

  it("fails with variable names but not secret values", () => {
    expect(() => parseServerEnvironment({ ...validEnvironment, AUTH_SECRET: "short" })).toThrow("AUTH_SECRET")
    expect(() => parseServerEnvironment({ ...validEnvironment, AUTH_SECRET: "short" })).not.toThrow("short")
  })

  it("accepts the required vars alone, with every optional integration var absent", () => {
    const result = parseServerEnvironment(validEnvironment)
    expect(result.RESEND_API_KEY).toBeUndefined()
    expect(result.R2_ACCOUNT_ID).toBeUndefined()
  })

  it("treats an empty-string optional var the same as absent (matches .env.example placeholders)", () => {
    const result = parseServerEnvironment({
      ...validEnvironment,
      RESEND_API_KEY: "",
      R2_ACCOUNT_ID: "",
      R2_ACCESS_KEY_ID: "",
      R2_SECRET_ACCESS_KEY: "",
      R2_BUCKET_NAME: "",
      R2_PUBLIC_URL: "",
    })
    expect(result.RESEND_API_KEY).toBeUndefined()
    expect(result.R2_PUBLIC_URL).toBeUndefined()
  })

  it("accepts optional integration vars when present and well-formed", () => {
    const result = parseServerEnvironment({
      ...validEnvironment,
      RESEND_API_KEY: "re_test_key",
      RESEND_FROM_EMAIL: "no-reply@example.com",
      R2_ACCOUNT_ID: "account",
      R2_ACCESS_KEY_ID: "key",
      R2_SECRET_ACCESS_KEY: "secret",
      R2_BUCKET_NAME: "bucket",
      R2_PUBLIC_URL: "https://media.example.com",
    })
    expect(result.RESEND_API_KEY).toBe("re_test_key")
    expect(result.R2_PUBLIC_URL).toBe("https://media.example.com")
  })

  it("rejects a present-but-malformed optional var, naming the variable but not its value", () => {
    expect(() => parseServerEnvironment({ ...validEnvironment, R2_PUBLIC_URL: "not-a-url" })).toThrow("R2_PUBLIC_URL")
    expect(() => parseServerEnvironment({ ...validEnvironment, R2_PUBLIC_URL: "not-a-url" })).not.toThrow("not-a-url")
  })
})
