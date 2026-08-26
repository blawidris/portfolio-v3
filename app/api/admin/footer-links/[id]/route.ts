import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { handleApiError, parseJsonRequest, unauthorizedResponse } from "@/lib/errors/api"
import { footerLinkUpdateSchema } from "@/lib/validation/footer-links"
import { revalidateFooterLinks } from "@/lib/content/cache"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return unauthorizedResponse()

  try {
    const { id } = await params
    const input = footerLinkUpdateSchema.parse(await parseJsonRequest(req))
    const link = await prisma.footerLink.update({ where: { id }, data: input })
    revalidateFooterLinks()
    return Response.json(link)
  } catch (error) {
    return handleApiError(error, "footer-links.update")
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
    await prisma.footerLink.delete({ where: { id } })
    revalidateFooterLinks()
    return new Response(null, { status: 204 })
  } catch (error) {
    return handleApiError(error, "footer-links.delete")
  }
}
