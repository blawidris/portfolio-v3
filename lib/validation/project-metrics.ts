import { z } from "zod"
import { trimmedText } from "@/lib/validation/common"

export const projectMetricInputSchema = z.object({
  projectId: trimmedText("Project", 100),
  label: trimmedText("Label", 100),
  value: trimmedText("Value", 100),
  context: z.string().trim().max(300).optional(),
  order: z.coerce.number().int().min(0).max(100_000).default(0),
}).strict()

export type ProjectMetricInput = z.infer<typeof projectMetricInputSchema>
