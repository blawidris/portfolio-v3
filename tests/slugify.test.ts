import { describe, expect, it } from "vitest"
import { slugify } from "@/lib/slugify"

describe("slugify", () => {
  it("normalizes spacing, punctuation, and case", () => {
    expect(slugify("  Reliable SaaS APIs!  ")).toBe("reliable-saas-apis")
  })

  it("collapses repeated separators", () => {
    expect(slugify("one___two -- three")).toBe("one-two-three")
  })
})
