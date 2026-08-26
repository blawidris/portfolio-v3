import { Prisma } from "@prisma/client"
import { ZodError } from "zod"
import { logServerError } from "@/lib/logger"

type FieldErrors = Record<string, string[]>

export function apiError(
  status: number,
  code: string,
  message: string,
  fields?: FieldErrors,
) {
  return Response.json(
    { error: { code, message, ...(fields ? { fields } : {}) } },
    { status },
  )
}

export function unauthorizedResponse() {
  return apiError(401, "UNAUTHENTICATED", "Authentication is required.")
}

export async function parseJsonRequest(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    throw new MalformedJsonError()
  }
}

export class MalformedJsonError extends Error {
  constructor() {
    super("The request body must be valid JSON.")
    this.name = "MalformedJsonError"
  }
}

function zodFields(error: ZodError): FieldErrors {
  const fields: FieldErrors = {}

  for (const issue of error.issues) {
    const field = issue.path.length > 0 ? issue.path.join(".") : "form"
    fields[field] ??= []
    fields[field].push(issue.message)
  }

  return fields
}

export function handleApiError(error: unknown, context: string) {
  if (error instanceof MalformedJsonError) {
    return apiError(400, "MALFORMED_REQUEST", error.message)
  }

  if (error instanceof ZodError) {
    return apiError(
      422,
      "VALIDATION_ERROR",
      "The submitted data is invalid.",
      zodFields(error),
    )
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return apiError(409, "CONFLICT", "A record with that unique value already exists.")
    }

    if (error.code === "P2025") {
      return apiError(404, "NOT_FOUND", "The requested record was not found.")
    }
  }

  logServerError("Administrator API request failed.", error, { context })
  return apiError(500, "INTERNAL_ERROR", "An unexpected error occurred.")
}
