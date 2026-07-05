/**
 * Sanitize HTML to prevent XSS when rendering user or untrusted content.
 * Uses DOMPurify in the browser; on server returns empty string.
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === "undefined") return "";
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const DOMPurify = require("dompurify") as { sanitize: (d: string, o?: object) => string };
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "u", "s", "a", "ul", "ol", "li",
      "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "code", "pre",
      "table", "thead", "tbody", "tr", "th", "td", "span", "div",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "class", "style"],
  });
}
