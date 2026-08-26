import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { handleApiError, parseJsonRequest, unauthorizedResponse } from "@/lib/errors/api"
import { navigationItemUpdateSchema } from "@/lib/validation/navigation"
import { revalidateNavigation } from "@/lib/content/cache"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  try {
    const { id } = await params
    const input = navigationItemUpdateSchema.parse(await parseJsonRequest(req))
    const item = await prisma.navigationItem.update({ where: { id }, data: input })
    revalidateNavigation()
    return Response.json(item)
  } catch (error) {
    return handleApiError(error, "navigation.update")
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  try {
    const { id } = await params
    await prisma.navigationItem.delete({ where: { id } })
    revalidateNavigation()
    return new Response(null, { status: 204 })
  } catch (error) {
    return handleApiError(error, "navigation.delete")
  }
}
