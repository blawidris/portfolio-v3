import "server-only"

import { logServerError } from "@/lib/logger"

export async function executeContentQuery<T>(name: string, query: () => Promise<T>): Promise<T> {
  try {
    return await query()
  } catch (error) {
    logServerError("Public content query failed.", error, { query: name })
    throw error
  }
}
