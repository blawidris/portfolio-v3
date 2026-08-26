import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { handleApiError, parseJsonRequest, unauthorizedResponse } from "@/lib/errors/api"
import { navigationItemInputSchema } from "@/lib/validation/navigation"
import { revalidateNavigation } from "@/lib/content/cache"

export async function GET() {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  const items = await prisma.navigationItem.findMany({ orderBy: { order: "asc" } })
  return Response.json(items)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  try {
    const input = navigationItemInputSchema.parse(await parseJsonRequest(req))
    const item = await prisma.navigationItem.create({ data: input })
    revalidateNavigation()
    return Response.json(item, { status: 201 })
  } catch (error) {
    return handleApiError(error, "navigation.create")
  }
}
