"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"

const navLinks = [
  { href: "/projects", label: "Work" },
  { href: "/writing", label: "Writing" },
  { href: "/about", label: "About" },
  { href: "/uses", label: "Uses" },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "backdrop-blur-sm bg-[var(--bg-primary)]/80 border-b border-[var(--border)]" : ""
      }`}
    >
      <nav className="max-w-[1100px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-mono text-[var(--accent)] font-bold text-lg tracking-tight">IL</span>
          <span className="text-[var(--text-secondary)] text-sm group-hover:text-[var(--text-primary)] transition-colors">
            Idris Lawal
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm transition-colors hover:text-[var(--text-primary)] ${
                pathname.startsWith(href)
                  ? "text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
          >
            Contact →
          </Link>
        </div>

        <button
          className="md:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {menuOpen && (
        <div className="md:hidden bg-[var(--bg-secondary)] border-b border-[var(--border)] px-6 pb-6 pt-2">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="block py-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors border-b border-[var(--border)] last:border-0"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="block pt-4 text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
          >
            Contact →
          </Link>
        </div>
      )}
    </header>
  )
}
