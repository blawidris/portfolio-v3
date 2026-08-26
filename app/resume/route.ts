import { getActiveResume } from "@/lib/content/resume/queries"
import { getMediaUrl, StorageNotConfiguredError } from "@/lib/storage/r2"

export async function GET() {
  const resume = await getActiveResume()
  if (!resume) {
    return new Response("Not found", { status: 404 })
  }

  try {
    const url = getMediaUrl(resume.media.storageKey)
    return Response.redirect(url, 307)
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) {
      return new Response("Not found", { status: 404 })
    }
    throw error
  }
}
