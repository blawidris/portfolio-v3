import { beforeEach, describe, expect, it, vi } from "vitest"

const { auth, mockPrisma, uploadMedia, deleteMedia } = vi.hoisted(() => {
  const mediaCreate = vi.fn()
  const resumeUpdateMany = vi.fn()
  const resumeCreate = vi.fn()
  const resumeUpdate = vi.fn()
  const resumeFindMany = vi.fn()
  const resumeFindUnique = vi.fn()
  const mediaDelete = vi.fn()

  const prisma = {
    media: { create: mediaCreate, delete: mediaDelete },
    resume: {
      updateMany: resumeUpdateMany,
      create: resumeCreate,
      update: resumeUpdate,
      findMany: resumeFindMany,
      findUnique: resumeFindUnique,
    },
    $transaction: vi.fn((callback: (tx: unknown) => unknown) => callback(prisma)),
  }

  return { auth: vi.fn(), mockPrisma: prisma, uploadMedia: vi.fn(), deleteMedia: vi.fn() }
})

vi.mock("@/auth", () => ({ auth }))
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }))
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }))
vi.mock("@/lib/storage/r2", async () => {
  const actual = await vi.importActual<typeof import("@/lib/storage/r2")>("@/lib/storage/r2")
  return { ...actual, uploadMedia, deleteMedia }
})

import { POST as uploadResume } from "@/app/api/admin/resume/route"
import { PATCH as activateResume, DELETE as deleteResume } from "@/app/api/admin/resume/[id]/route"
import { StorageNotConfiguredError } from "@/lib/storage/r2"

const PDF_HEADER = Buffer.from("%PDF-1.7\n%test resume content")

function uploadRequest(file: File) {
  const formData = new FormData()
  formData.append("file", file)
  return new Request("http://localhost/api/admin/resume", { method: "POST", body: formData })
}

function params(id: string) {
  return { params: Promise.resolve({ id }) }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockPrisma.$transaction.mockImplementation((callback: (tx: unknown) => unknown) => callback(mockPrisma))
  auth.mockResolvedValue({ user: { email: "admin@example.com" } })
})

describe("POST /api/admin/resume", () => {
  it("rejects an unauthenticated request", async () => {
    auth.mockResolvedValue(null)
    const file = new File([PDF_HEADER], "resume.pdf", { type: "application/pdf" })
    const res = await uploadResume(uploadRequest(file))
    expect(res.status).toBe(401)
    expect(uploadMedia).not.toHaveBeenCalled()
  })

  it("rejects a file whose real content isn't a PDF", async () => {
    const file = new File([Buffer.from("not a pdf")], "resume.pdf", { type: "application/pdf" })
    const res = await uploadResume(uploadRequest(file))
    expect(res.status).toBe(422)
    expect(uploadMedia).not.toHaveBeenCalled()
  })

  it("returns 503 when storage is not configured", async () => {
    uploadMedia.mockRejectedValue(new StorageNotConfiguredError())
    const file = new File([PDF_HEADER], "resume.pdf", { type: "application/pdf" })
    const res = await uploadResume(uploadRequest(file))
    expect(res.status).toBe(503)
  })

  it("uploads, creates the resume as active, and deactivates any other active resume", async () => {
    uploadMedia.mockResolvedValue(undefined)
    mockPrisma.media.create.mockResolvedValue({ id: "media-1", storageKey: "resume/1-resume.pdf" })
    mockPrisma.resume.create.mockResolvedValue({ id: "resume-1", isActive: true, publicFilename: "resume.pdf" })

    const file = new File([PDF_HEADER], "resume.pdf", { type: "application/pdf" })
    const res = await uploadResume(uploadRequest(file))

    expect(res.status).toBe(201)
    expect(mockPrisma.resume.updateMany).toHaveBeenCalledWith({ where: { isActive: true }, data: { isActive: false } })
    expect(mockPrisma.resume.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ mediaId: "media-1", isActive: true }),
    }))
  })
})

describe("PATCH /api/admin/resume/[id]", () => {
  it("rejects an unauthenticated request", async () => {
    auth.mockResolvedValue(null)
    const res = await activateResume(new Request("http://localhost/x"), params("1"))
    expect(res.status).toBe(401)
  })

  it("activates the given resume and deactivates all others", async () => {
    mockPrisma.resume.update.mockResolvedValue({ id: "1", isActive: true })
    const res = await activateResume(new Request("http://localhost/x"), params("1"))
    expect(res.status).toBe(200)
    expect(mockPrisma.resume.updateMany).toHaveBeenCalledWith({ where: { isActive: true }, data: { isActive: false } })
    expect(mockPrisma.resume.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "1" }, data: { isActive: true } }))
  })
})

describe("DELETE /api/admin/resume/[id]", () => {
  it("rejects an unauthenticated request", async () => {
    auth.mockResolvedValue(null)
    const res = await deleteResume(new Request("http://localhost/x"), params("1"))
    expect(res.status).toBe(401)
  })

  it("returns 404 for an unknown id", async () => {
    mockPrisma.resume.findUnique.mockResolvedValue(null)
    const res = await deleteResume(new Request("http://localhost/x"), params("missing"))
    expect(res.status).toBe(404)
  })

  it("deletes the storage object and the underlying media row", async () => {
    mockPrisma.resume.findUnique.mockResolvedValue({ id: "1", mediaId: "media-1", media: { storageKey: "resume/1.pdf" } })
    deleteMedia.mockResolvedValue(undefined)
    mockPrisma.media.delete.mockResolvedValue({})

    const res = await deleteResume(new Request("http://localhost/x"), params("1"))

    expect(res.status).toBe(204)
    expect(deleteMedia).toHaveBeenCalledWith("resume/1.pdf")
    expect(mockPrisma.media.delete).toHaveBeenCalledWith({ where: { id: "media-1" } })
  })
})
