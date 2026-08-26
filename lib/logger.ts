type LogContext = Record<string, string | number | boolean | null | undefined>

function safeError(error: unknown) {
  if (error instanceof Error) {
    return { name: error.name, message: error.message }
  }

  return { name: "UnknownError", message: "An unknown error occurred." }
}

export function logServerError(message: string, error: unknown, context: LogContext = {}) {
  console.error(message, { ...context, error: safeError(error) })
}
