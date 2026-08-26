export const publishedPostWhere = { published: true } as const

// Projects do not have a publication field yet. Keeping this policy in one
// place lets a later phase add project visibility without changing every consumer.
export const publicProjectWhere = {} as const

export const visibleWhere = { visible: true } as const
export const activeResumeWhere = { isActive: true, publicDownload: true } as const
