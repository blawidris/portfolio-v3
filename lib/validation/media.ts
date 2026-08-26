export class MediaValidationError extends Error {}

const MAX_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"])

// Never trust a client-declared Content-Type — sniff the real format from
// the file's magic bytes instead. Deliberately excludes image/svg+xml,
// which can carry embedded <script>.
function sniffImageMimeType(buffer: Buffer): string | null {
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return "image/png"
  }
  if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) {
    return "image/jpeg"
  }
  const header = buffer.subarray(0, 6).toString("ascii")
  if (header === "GIF87a" || header === "GIF89a") {
    return "image/gif"
  }
  if (buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") {
    return "image/webp"
  }
  return null
}

export function validateMediaUpload(buffer: Buffer, filename: string): { mimeType: string } {
  if (buffer.length === 0) throw new MediaValidationError("The uploaded file is empty.")
  if (buffer.length > MAX_SIZE_BYTES) throw new MediaValidationError("Files must be 5MB or smaller.")
  if (!filename.trim()) throw new MediaValidationError("A filename is required.")

  const mimeType = sniffImageMimeType(buffer)
  if (!mimeType || !ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new MediaValidationError("Only PNG, JPEG, WebP, and GIF images are allowed.")
  }

  return { mimeType }
}
