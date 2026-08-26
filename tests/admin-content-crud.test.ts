import { beforeEach, describe, expect, it, vi } from "vitest"

const { auth, mockPrisma } = vi.hoisted(() => {
  const modelMock = () => ({ create: vi.fn(), update: vi.fn(), delete: vi.fn(), findMany: vi.fn(), findUnique: vi.fn() })
  return {
    auth: vi.fn(),
    mockPrisma: {
      experience: modelMock(),
      skillCategory: modelMock(),
      skill: modelMock(),
      certification: modelMock(),
      navigationItem: modelMock(),
    },
  }
})

vi.mock("@/auth", () => ({ auth }))
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }))
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }))

import { POST as createExperience } from "@/app/api/admin/experience/route"
import { PATCH as updateExperience, DELETE as deleteExperience } from "@/app/api/admin/experience/[id]/route"
import { POST as createSkillCategory } from "@/app/api/admin/skill-categories/route"
import { PATCH as updateSkillCategory, DELETE as deleteSkillCategory } from "@/app/api/admin/skill-categories/[id]/route"
import { POST as createSkill } from "@/app/api/admin/skills/route"
import { PATCH as updateSkill, DELETE as deleteSkill } from "@/app/api/admin/skills/[id]/route"
import { POST as createCertification } from "@/app/api/admin/certifications/route"
import { PATCH as updateCertification, DELETE as deleteCertification } from "@/app/api/admin/certifications/[id]/route"
import { POST as createNavigation } from "@/app/api/admin/navigation/route"
import { PATCH as updateNavigation, DELETE as deleteNavigation } from "@/app/api/admin/navigation/[id]/route"

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/admin/x", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

function params(id: string) {
  return { params: Promise.resolve({ id }) }
}

const resources = [
  {
    name: "experience",
    model: mockPrisma.experience,
    create: createExperience,
    update: updateExperience,
    delete: deleteExperience,
    valid: { role: "Engineer", company: "Acme", period: "2020 – 2021", description: "Did engineering things." },
    invalid: { role: "", company: "Acme", period: "2020", description: "x" },
  },
  {
    name: "skill-categories",
    model: mockPrisma.skillCategory,
    create: createSkillCategory,
    update: updateSkillCategory,
    delete: deleteSkillCategory,
    valid: { name: "Testing", slug: "testing" },
    invalid: { name: "Testing", slug: "Not A Slug" },
  },
  {
    name: "skills",
    model: mockPrisma.skill,
    create: createSkill,
    update: updateSkill,
    delete: deleteSkill,
    valid: { name: "Vitest", categoryId: "category-1" },
    invalid: { name: "", categoryId: "category-1" },
  },
  {
    name: "certifications",
    model: mockPrisma.certification,
    create: createCertification,
    update: updateCertification,
    delete: deleteCertification,
    valid: { name: "Cert", issuer: "Issuer", issueDate: "2024-01-01" },
    invalid: { name: "", issuer: "Issuer", issueDate: "2024-01-01" },
  },
  {
    name: "navigation",
    model: mockPrisma.navigationItem,
    create: createNavigation,
    update: updateNavigation,
    delete: deleteNavigation,
    valid: { label: "Work", href: "/projects" },
    invalid: { label: "Work", href: "projects" },
  },
]

beforeEach(() => {
  vi.clearAllMocks()
  auth.mockResolvedValue({ user: { email: "admin@example.com" } })
})

describe.each(resources)("$name admin routes", ({ model, create, update, delete: destroy, valid, invalid }) => {
  it("rejects an unauthenticated create", async () => {
    auth.mockResolvedValue(null)
    const res = await create(jsonRequest(valid))
    expect(res.status).toBe(401)
    expect(model.create).not.toHaveBeenCalled()
  })

  it("rejects invalid input on create", async () => {
    const res = await create(jsonRequest(invalid))
    expect(res.status).toBe(422)
    expect(model.create).not.toHaveBeenCalled()
  })

  it("accepts a valid create", async () => {
    model.create.mockResolvedValue({ id: "1", ...valid })
    const res = await create(jsonRequest(valid))
    expect(res.status).toBe(201)
    expect(model.create).toHaveBeenCalled()
  })

  it("rejects an unauthenticated update", async () => {
    auth.mockResolvedValue(null)
    const res = await update(jsonRequest({}), params("1"))
    expect(res.status).toBe(401)
    expect(model.update).not.toHaveBeenCalled()
  })

  it("rejects an update with no fields", async () => {
    const res = await update(jsonRequest({}), params("1"))
    expect(res.status).toBe(422)
    expect(model.update).not.toHaveBeenCalled()
  })

  it("rejects an unauthenticated delete", async () => {
    auth.mockResolvedValue(null)
    const res = await destroy(new Request("http://localhost/x"), params("1"))
    expect(res.status).toBe(401)
    expect(model.delete).not.toHaveBeenCalled()
  })

  it("deletes when authenticated", async () => {
    model.delete.mockResolvedValue({})
    const res = await destroy(new Request("http://localhost/x"), params("1"))
    expect(res.status).toBe(204)
    expect(model.delete).toHaveBeenCalledWith({ where: { id: "1" } })
  })
})
