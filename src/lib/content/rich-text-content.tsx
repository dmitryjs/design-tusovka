import { sanitizeRichHtml } from "@/lib/content/rich-text";
import { cn } from "@/lib/utils";

type RichTextContentProps = {
  html: string;
  className?: string;
  as?: "span" | "p" | "div";
};

export function RichTextContent({ html, className, as: Tag = "span" }: RichTextContentProps) {
  if (!html) {
    return null;
  }

  if (!html.includes("<")) {
    return <Tag className={className}>{html}</Tag>;
  }

  const safe = sanitizeRichHtml(html);

  if (!safe) {
    return null;
  }

  return (
    <Tag
      className={cn(
        "[&_a]:text-primary [&_a]:underline",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
