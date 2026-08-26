export class ResumeValidationError extends Error {}

const MAX_SIZE_BYTES = 10 * 1024 * 1024
const PDF_MAGIC_BYTES = Buffer.from("%PDF-", "ascii")

// Never trust a client-declared Content-Type — sniff the real format from
// the file's magic bytes, same principle as lib/validation/media.ts.
export function validateResumeUpload(buffer: Buffer, filename: string): { mimeType: string } {
  if (buffer.length === 0) throw new ResumeValidationError("The uploaded file is empty.")
  if (buffer.length > MAX_SIZE_BYTES) throw new ResumeValidationError("Files must be 10MB or smaller.")
  if (!filename.trim()) throw new ResumeValidationError("A filename is required.")

  if (!buffer.subarray(0, PDF_MAGIC_BYTES.length).equals(PDF_MAGIC_BYTES)) {
    throw new ResumeValidationError("Only PDF files are allowed.")
  }

  return { mimeType: "application/pdf" }
}
