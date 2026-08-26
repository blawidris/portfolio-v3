import { beforeEach, describe, expect, it, vi } from "vitest"

const { auth, mediaFindMany, mediaCreate, mediaFindUnique, mediaDelete, uploadMedia, deleteMedia, getMediaUrl } = vi.hoisted(() => ({
  auth: vi.fn(),
  mediaFindMany: vi.fn(),
  mediaCreate: vi.fn(),
  mediaFindUnique: vi.fn(),
  mediaDelete: vi.fn(),
  uploadMedia: vi.fn(),
  deleteMedia: vi.fn(),
  getMediaUrl: vi.fn(),
}))

vi.mock("@/auth", () => ({ auth }))
vi.mock("@/lib/prisma", () => ({
  prisma: {
    media: { findMany: mediaFindMany, create: mediaCreate, findUnique: mediaFindUnique, delete: mediaDelete },
  },
}))
vi.mock("@/lib/storage/r2", async () => {
  const actual = await vi.importActual<typeof import("@/lib/storage/r2")>("@/lib/storage/r2")
  return { ...actual, uploadMedia, deleteMedia, getMediaUrl }
})

import { GET as listMedia, POST as uploadMediaRoute } from "@/app/api/admin/media/route"
import { DELETE as deleteMediaRoute } from "@/app/api/admin/media/[id]/route"
import { StorageNotConfiguredError } from "@/lib/storage/r2"

const PNG_HEADER = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])

function uploadRequest(file: File) {
  const formData = new FormData()
  formData.append("file", file)
  return new Request("http://localhost/api/admin/media", { method: "POST", body: formData })
}

beforeEach(() => {
  vi.clearAllMocks()
  auth.mockResolvedValue({ user: { email: "admin@example.com" } })
  getMediaUrl.mockReturnValue("https://media.example.com/key")
})

describe("GET /api/admin/media", () => {
  it("rejects an unauthenticated request", async () => {
    auth.mockResolvedValue(null)
    const res = await listMedia()
    expect(res.status).toBe(401)
  })

  it("returns 503 when storage is not configured", async () => {
    mediaFindMany.mockResolvedValue([{ id: "1", storageKey: "media/1.png" }])
    getMediaUrl.mockImplementation(() => { throw new StorageNotConfiguredError() })

    const res = await listMedia()

    expect(res.status).toBe(503)
  })

  it("lists media with resolved URLs", async () => {
    mediaFindMany.mockResolvedValue([{ id: "1", storageKey: "media/1.png", filename: "1.png" }])
    const res = await listMedia()
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body[0].url).toBe("https://media.example.com/key")
  })
})

describe("POST /api/admin/media", () => {
  it("rejects an unauthenticated request", async () => {
    auth.mockResolvedValue(null)
    const file = new File([PNG_HEADER], "test.png", { type: "image/png" })
    const res = await uploadMediaRoute(uploadRequest(file))
    expect(res.status).toBe(401)
    expect(uploadMedia).not.toHaveBeenCalled()
  })

  it("rejects a file whose real content doesn't match an allowed image type", async () => {
    const file = new File([Buffer.from("not an image")], "fake.png", { type: "image/png" })
    const res = await uploadMediaRoute(uploadRequest(file))
    expect(res.status).toBe(422)
    expect(uploadMedia).not.toHaveBeenCalled()
  })

  it("rejects a file over the size cap", async () => {
    const big = Buffer.concat([PNG_HEADER, Buffer.alloc(6 * 1024 * 1024)])
    const file = new File([big], "big.png", { type: "image/png" })
    const res = await uploadMediaRoute(uploadRequest(file))
    expect(res.status).toBe(422)
  })

  it("returns 503 when storage is not configured", async () => {
    uploadMedia.mockRejectedValue(new StorageNotConfiguredError())
    const file = new File([PNG_HEADER], "test.png", { type: "image/png" })
    const res = await uploadMediaRoute(uploadRequest(file))
    expect(res.status).toBe(503)
  })

  it("uploads and persists a valid image", async () => {
    uploadMedia.mockResolvedValue(undefined)
    mediaCreate.mockResolvedValue({ id: "1", filename: "test.png", mimeType: "image/png", size: PNG_HEADER.length, storageKey: "media/1-test.png" })

    const file = new File([PNG_HEADER], "test.png", { type: "image/png" })
    const res = await uploadMediaRoute(uploadRequest(file))
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.url).toBe("https://media.example.com/key")
    expect(uploadMedia).toHaveBeenCalled()
  })
})

describe("DELETE /api/admin/media/[id]", () => {
  function params(id: string) {
    return { params: Promise.resolve({ id }) }
  }

  it("rejects an unauthenticated request", async () => {
    auth.mockResolvedValue(null)
    const res = await deleteMediaRoute(new Request("http://localhost/x"), params("1"))
    expect(res.status).toBe(401)
  })

  it("returns 404 for an unknown id", async () => {
    mediaFindUnique.mockResolvedValue(null)
    const res = await deleteMediaRoute(new Request("http://localhost/x"), params("missing"))
    expect(res.status).toBe(404)
  })

  it("returns 503 when storage is not configured", async () => {
    mediaFindUnique.mockResolvedValue({ id: "1", storageKey: "media/1.png" })
    deleteMedia.mockRejectedValue(new StorageNotConfiguredError())
    const res = await deleteMediaRoute(new Request("http://localhost/x"), params("1"))
    expect(res.status).toBe(503)
  })

  it("deletes the storage object and the database record", async () => {
    mediaFindUnique.mockResolvedValue({ id: "1", storageKey: "media/1.png" })
    deleteMedia.mockResolvedValue(undefined)
    mediaDelete.mockResolvedValue({})

    const res = await deleteMediaRoute(new Request("http://localhost/x"), params("1"))

    expect(res.status).toBe(204)
    expect(deleteMedia).toHaveBeenCalledWith("media/1.png")
    expect(mediaDelete).toHaveBeenCalledWith({ where: { id: "1" } })
  })
})
