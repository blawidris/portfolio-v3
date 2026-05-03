import type { Metadata } from "next"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://idrislawal.dev"

export function buildMetadata({
  title,
  description,
  path = "",
}: {
  title: string
  description: string
  path?: string
}): Metadata {
  const url = `${siteUrl}${path}`
  return {
    title: `${title} | Idris Lawal`,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "Idris Lawal",
      images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${siteUrl}/og-image.png`],
    },
    alternates: { canonical: url },
  }
}
