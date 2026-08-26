import { getVisibleNavigationItems } from "@/lib/content/navigation/queries"
import NavbarContent from "@/components/layout/NavbarContent"

export default async function Navbar() {
  const items = await getVisibleNavigationItems()
  const navLinks = items.map(({ href, label }) => ({ href, label }))

  return <NavbarContent navLinks={navLinks} />
}
