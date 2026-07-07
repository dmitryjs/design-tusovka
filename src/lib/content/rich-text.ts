import { substituteEmDashInPlainText } from "./text-substitutions";

const ALLOWED_TAGS = new Set([
  "b",
  "strong",
  "i",
  "em",
  "u",
  "s",
  "strike",
  "a",
  "span",
  "br",
]);

const ALLOWED_LINK_PROTOCOLS = ["http:", "https:", "mailto:"];

function shouldStripBackgroundColor(raw: string): boolean {
  const value = raw.trim().toLowerCase();

  if (
    !value ||
    value === "transparent" ||
    value === "inherit" ||
    value === "initial" ||
    value === "unset" ||
    value === "none" ||
    value === "white" ||
    value === "#fff" ||
    value === "#ffffff" ||
    value === "rgb(255, 255, 255)" ||
    value === "rgba(255, 255, 255, 1)" ||
    value === "rgb(255,255,255)" ||
    value === "rgba(255,255,255,1)"
  ) {
    return true;
  }

  return false;
}

function cleanInlineStyle(style: string): string {
  const parts = style
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);

  const kept: string[] = [];

  for (const part of parts) {
    const colonIndex = part.indexOf(":");
    if (colonIndex === -1) {
      continue;
    }

    const property = part.slice(0, colonIndex).trim().toLowerCase();
    const rawValue = part.slice(colonIndex + 1).trim();

    if (property === "background-color" || property === "background") {
      if (shouldStripBackgroundColor(rawValue)) {
        continue;
      }
    }

    kept.push(`${property}: ${rawValue}`);
  }

  return kept.join("; ");
}

function isAllowedStyle(style: string): boolean {
  const cleaned = cleanInlineStyle(style);
  if (!cleaned) {
    return false;
  }

  const parts = cleaned.split(";").map((part) => part.trim().toLowerCase());
  return parts.every((part) => {
    if (!part) {
      return true;
    }

    return (
      part.startsWith("color:") ||
      part.startsWith("background-color:") ||
      part.startsWith("text-decoration:")
    );
  });
}

function sanitizeHref(href: string): string | null {
  const trimmed = href.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed, "https://example.com");
    if (!ALLOWED_LINK_PROTOCOLS.includes(url.protocol)) {
      return null;
    }
    return trimmed;
  } catch {
    return null;
  }
}

function sanitizeAttributes(tag: string, attrs: string): string {
  if (tag === "br") {
    return "";
  }

  if (tag === "a") {
    const hrefMatch = attrs.match(/\bhref\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const href = hrefMatch?.[2] ?? hrefMatch?.[3] ?? hrefMatch?.[4] ?? "";
    const safeHref = sanitizeHref(href);
    return safeHref ? ` href="${safeHref.replace(/"/g, "&quot;")}"` : "";
  }

  if (tag === "span") {
    const styleMatch = attrs.match(/\bstyle\s*=\s*("([^"]*)"|'([^']*)')/i);
    const style = styleMatch?.[2] ?? styleMatch?.[3] ?? "";
    const cleaned = style ? cleanInlineStyle(style) : "";
    if (cleaned && isAllowedStyle(cleaned)) {
      return ` style="${cleaned.replace(/"/g, "&quot;")}"`;
    }
  }

  return "";
}

function sanitizeRichHtmlRegex(html: string): string {
  const withFontSpans = html.replace(
    /<font\b([^>]*)>([\s\S]*?)<\/font>/gi,
    (_match, rawAttrs, inner) => {
      const colorMatch = rawAttrs.match(/\bcolor\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i);
      const color = colorMatch?.[2] ?? colorMatch?.[3] ?? colorMatch?.[4] ?? "";
      const style = color ? ` style="color: ${color.replace(/"/g, "&quot;")}"` : "";
      return `<span${style}>${inner}</span>`;
    },
  );

  return withFontSpans.replace(/<\/?([a-z][a-z0-9]*)\b([^>]*)>/gi, (match, rawTag, rawAttrs) => {
    const tag = rawTag.toLowerCase();
    const isClosing = match.startsWith("</");

    if (!ALLOWED_TAGS.has(tag)) {
      return "";
    }

    if (isClosing) {
      return `</${tag}>`;
    }

    if (tag === "br") {
      return "<br>";
    }

    return `<${tag}${sanitizeAttributes(tag, rawAttrs)}>`;
  });
}

function sanitizeRichHtmlDom(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const body = doc.body;

  const walk = (node: Node): void => {
    const children = [...node.childNodes];

    for (const child of children) {
      if (child.nodeType === Node.TEXT_NODE) {
        continue;
      }

      if (child.nodeType !== Node.ELEMENT_NODE) {
        child.parentNode?.removeChild(child);
        continue;
      }

      const element = child as HTMLElement;
      const tagName = element.tagName.toLowerCase();

      if (tagName === "font") {
        const span = doc.createElement("span");
        const color = element.getAttribute("color");
        if (color) {
          span.setAttribute("style", `color: ${color}`);
        }
        while (element.firstChild) {
          span.appendChild(element.firstChild);
        }
        element.parentNode?.replaceChild(span, element);
        walk(span);
        continue;
      }

      if (!ALLOWED_TAGS.has(tagName)) {
        while (element.firstChild) {
          element.parentNode?.insertBefore(element.firstChild, element);
        }
        element.parentNode?.removeChild(element);
        continue;
      }

      if (element.tagName === "A") {
        const href = element.getAttribute("href") ?? "";
        const safeHref = sanitizeHref(href);
        if (safeHref) {
          element.setAttribute("href", safeHref);
        } else {
          element.removeAttribute("href");
        }
      }

      if (element.tagName === "SPAN") {
        const style = element.getAttribute("style");
        if (style) {
          const cleaned = cleanInlineStyle(style);
          if (cleaned && isAllowedStyle(cleaned)) {
            element.setAttribute("style", cleaned);
          } else {
            element.removeAttribute("style");
          }
        }
      }

      [...element.attributes].forEach((attr) => {
        if (element.tagName === "A" && attr.name === "href") {
          return;
        }
        if (element.tagName === "SPAN" && attr.name === "style") {
          return;
        }
        element.removeAttribute(attr.name);
      });

      walk(element);
    }
  };

  walk(body);
  return body.innerHTML;
}

export function sanitizeRichHtml(html: string): string {
  if (!html || !html.includes("<")) {
    return html;
  }

  if (typeof DOMParser !== "undefined") {
    return sanitizeRichHtmlDom(html);
  }

  return sanitizeRichHtmlRegex(html);
}

export function richTextToPlainText(html: string): string {
  if (!html) {
    return "";
  }

  if (!html.includes("<")) {
    return html;
  }

  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}

export function normalizeRichTextValue(value: string): string {
  if (!value) {
    return "";
  }

  if (value.includes("<")) {
    return value;
  }

  return substituteEmDashInPlainText(value)
    .split("\n")
    .map((line) => line || "<br>")
    .join("<br>");
}

export function stripInlineTextColors(html: string): string {
  if (!html || !html.includes("style")) {
    return html;
  }

  if (typeof DOMParser === "undefined") {
    return html.replace(/\s*color\s*:\s*[^;"]+;?/gi, "");
  }

  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
  const spans = doc.body.querySelectorAll("span[style]");

  for (const span of spans) {
    const style = span.getAttribute("style");
    if (!style) {
      continue;
    }

    const cleaned = style
      .split(";")
      .map((part) => part.trim())
      .filter((part) => part && !part.toLowerCase().startsWith("color:"))
      .join("; ");

    if (cleaned) {
      span.setAttribute("style", cleaned);
    } else {
      span.removeAttribute("style");
    }
  }

  return doc.body.innerHTML;
}

