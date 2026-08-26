import { prisma } from "@/lib/prisma"
import { getMediaUrl, StorageNotConfiguredError } from "@/lib/storage/r2"
import MediaGrid from "@/components/admin/MediaGrid"

export default async function AdminMediaPage() {
  const items = await prisma.media.findMany({ orderBy: { createdAt: "desc" } })

  let media: Array<{ id: string; filename: string; url: string }> = []
  let storageConfigured = true

  try {
    media = items.map((item) => ({ id: item.id, filename: item.filename, url: getMediaUrl(item.storageKey) }))
  } catch (error) {
    if (!(error instanceof StorageNotConfiguredError)) throw error
    storageConfigured = false
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-8">Media</h1>
      {!storageConfigured && (
        <p className="text-sm text-[var(--text-muted)] bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-4 py-3 mb-6">
          Media storage isn&apos;t configured yet. Add Cloudflare R2 credentials to enable uploads.
        </p>
      )}
      <MediaGrid initialMedia={media} disabled={!storageConfigured} />
    </div>
  )
}
