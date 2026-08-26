import { beforeEach, describe, expect, it, vi } from "vitest"

const { experienceFindMany, skillCategoryFindMany, certificationFindMany, navigationFindMany, resumeFindFirst, profileFindUnique } = vi.hoisted(() => ({
  experienceFindMany: vi.fn(),
  skillCategoryFindMany: vi.fn(),
  certificationFindMany: vi.fn(),
  navigationFindMany: vi.fn(),
  resumeFindFirst: vi.fn(),
  profileFindUnique: vi.fn(),
}))

vi.mock("server-only", () => ({}))
vi.mock("next/cache", () => ({
  unstable_cache: (callback: () => unknown) => callback,
  revalidateTag: vi.fn(),
}))
vi.mock("@/lib/prisma", () => ({
  prisma: {
    experience: { findMany: experienceFindMany },
    skillCategory: { findMany: skillCategoryFindMany },
    certification: { findMany: certificationFindMany },
    navigationItem: { findMany: navigationFindMany },
    resume: { findFirst: resumeFindFirst },
    profile: { findUnique: profileFindUnique },
  },
}))

import { getVisibleExperience } from "@/lib/content/experience/queries"
import { getVisibleSkillCategories } from "@/lib/content/skills/queries"
import { getVisibleCertifications } from "@/lib/content/certifications/queries"
import { getVisibleNavigationItems } from "@/lib/content/navigation/queries"
import { getActiveResume } from "@/lib/content/resume/queries"
import { getProfile } from "@/lib/content/profile/queries"

beforeEach(() => {
  vi.clearAllMocks()
  experienceFindMany.mockResolvedValue([])
  skillCategoryFindMany.mockResolvedValue([])
  certificationFindMany.mockResolvedValue([])
  navigationFindMany.mockResolvedValue([])
  resumeFindFirst.mockResolvedValue(null)
  profileFindUnique.mockResolvedValue(null)
})

describe("public profile-content queries", () => {
  it("filters experience to visible records only, ordered", async () => {
    await getVisibleExperience()
    expect(experienceFindMany).toHaveBeenCalledWith({ where: { visible: true }, orderBy: { order: "asc" } })
  })

  it("filters skill categories and their nested skills to visible only", async () => {
    await getVisibleSkillCategories()
    expect(skillCategoryFindMany).toHaveBeenCalledWith({
      where: { visible: true },
      orderBy: { order: "asc" },
      include: { skills: { where: { visible: true }, orderBy: { order: "asc" } } },
    })
  })

  it("filters certifications to visible records only", async () => {
    await getVisibleCertifications()
    expect(certificationFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: { visible: true } }))
  })

  it("filters navigation items to visible records only", async () => {
    await getVisibleNavigationItems()
    expect(navigationFindMany).toHaveBeenCalledWith({ where: { visible: true }, orderBy: { order: "asc" } })
  })

  it("only returns a resume that is both active and marked for public download", async () => {
    await getActiveResume()
    expect(resumeFindFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { isActive: true, publicDownload: true },
    }))
  })

  it("reads the singleton profile by its fixed id", async () => {
    await getProfile()
    expect(profileFindUnique).toHaveBeenCalledWith({ where: { id: "profile" } })
  })
})
