import { marked } from "marked"

marked.setOptions({
  gfm: true,
  breaks: true,
})

export function parseMarkdown(content: string): string {
  const result = marked(content)
  if (typeof result === "string") return result
  return ""
}
