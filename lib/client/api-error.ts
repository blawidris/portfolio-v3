interface ApiErrorBody {
  error?: {
    message?: string
    fields?: Record<string, string[]>
  }
}

export async function readApiError(response: Response) {
  try {
    const body = await response.json() as ApiErrorBody
    const fieldMessage = body.error?.fields ? Object.values(body.error.fields).flat()[0] : undefined
    return fieldMessage ?? body.error?.message ?? "The request could not be completed."
  } catch {
    return "The request could not be completed."
  }
}
