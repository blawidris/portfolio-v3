import { describe, expect, it } from "vitest"
import { parseMarkdown } from "@/lib/markdown"

describe("parseMarkdown", () => {
  it("renders technical Markdown formatting", () => {
    const html = parseMarkdown("# Heading\n\n**bold** and *italic* with [docs](https://example.com).")
    expect(html).toContain("<h1>Heading</h1>")
    expect(html).toContain("<strong>bold</strong>")
    expect(html).toContain("<em>italic</em>")
    expect(html).toContain('href="https://example.com"')
  })

  it("preserves code blocks", () => {
    const html = parseMarkdown("```ts\nconst safe = true\n```")
    expect(html).toContain("<pre><code class=\"language-ts\">")
    expect(html).toContain("const safe = true")
  })

  it("preserves GFM tables", () => {
    const html = parseMarkdown("| Name | Value |\n| --- | --- |\n| latency | 20ms |")
    expect(html).toContain("<table>")
    expect(html).toContain("<td>20ms</td>")
  })

  it("removes script tags and their executable markup", () => {
    const html = parseMarkdown("Before<script>alert(1)</script>After")
    expect(html).not.toContain("<script")
    expect(html).not.toContain("</script>")
  })

  it("removes event handler attributes", () => {
    const html = parseMarkdown('<img src="https://example.com/image.png" onerror="alert(1)" alt="safe">')
    expect(html).toContain('src="https://example.com/image.png"')
    expect(html).toContain('alt="safe"')
    expect(html).not.toContain("onerror")
  })

  it("blocks javascript URLs", () => {
    const html = parseMarkdown('[click](javascript:alert(1)) <a href="javascript:alert(2)">unsafe</a>')
    expect(html).not.toContain("javascript:")
  })

  it("removes unsafe embeds and objects", () => {
    const html = parseMarkdown('<iframe src="https://example.com"></iframe><object data="x"></object>safe')
    expect(html).not.toContain("iframe")
    expect(html).not.toContain("object")
    expect(html).toContain("safe")
  })
})
