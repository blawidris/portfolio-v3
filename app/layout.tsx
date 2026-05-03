import type { Metadata } from "next"
import { Instrument_Serif, DM_Sans, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import "./globals.css"

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Idris Lawal — Senior Software Engineer",
  description:
    "Senior software engineer building scalable SaaS products and mobile applications for African markets — backend-first, cross-platform, outcome-driven.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://idrislawal.dev"),
  openGraph: {
    title: "Idris Lawal — Senior Software Engineer",
    description:
      "Senior software engineer building scalable SaaS products and mobile applications for African markets.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    siteName: "Idris Lawal",
  },
  twitter: {
    card: "summary_large_image",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}>
        <Navbar />
        <main className="pt-16">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
