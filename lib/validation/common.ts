import { z } from "zod"

export const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required.")
  .max(160, "Slug must be 160 characters or fewer.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain lowercase letters, numbers, and single hyphens only.")

export const trimmedText = (label: string, maximum: number) =>
  z.string().trim().min(1, `${label} is required.`).max(maximum, `${label} is too long.`)
