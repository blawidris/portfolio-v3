import { marked } from "marked"
import sanitizeHtml from "sanitize-html"

marked.setOptions({
  gfm: true,
  breaks: true,
})

export function parseMarkdown(content: string): string {
  const result = marked(content)
  if (typeof result === "string") {
    return sanitizeHtml(result, {
      allowedTags: [
        "h1", "h2", "h3", "h4", "h5", "h6", "p", "strong", "em", "del",
        "a", "ul", "ol", "li", "blockquote", "code", "pre", "table", "thead",
        "tbody", "tr", "th", "td", "hr", "br", "img",
      ],
      allowedAttributes: {
        a: ["href", "title"],
        img: ["src", "alt", "title", "width", "height"],
        code: ["class"],
        th: ["align"],
        td: ["align"],
      },
      allowedSchemes: ["http", "https", "mailto"],
      allowedSchemesByTag: {
        img: ["http", "https"],
      },
      allowProtocolRelative: false,
      disallowedTagsMode: "discard",
    })
  }
  return ""
}
