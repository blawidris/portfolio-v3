import { z } from "zod"
import { trimmedText } from "@/lib/validation/common"

export const projectChallengeInputSchema = z.object({
  projectId: trimmedText("Project", 100),
  title: trimmedText("Title", 200),
  description: trimmedText("Description", 4000),
  order: z.coerce.number().int().min(0).max(100_000).default(0),
}).strict()

export type ProjectChallengeInput = z.infer<typeof projectChallengeInputSchema>
