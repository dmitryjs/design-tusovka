import { sanitizeRichHtml } from "@/lib/content/rich-text";
import { cn } from "@/lib/utils";

/** Сохраняет жирный, курсив и другие inline-форматы поверх цвета родительского блока. */
export const RICH_TEXT_FORMAT_CLASS =
  "[&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic [&_u]:underline [&_s]:line-through [&_strike]:line-through [&_div]:bg-transparent [&_p]:m-0 [&_div]:m-0";

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
    return <Tag className={cn(RICH_TEXT_FORMAT_CLASS, className)}>{html}</Tag>;
  }

  const safe = sanitizeRichHtml(html);

  if (!safe) {
    return null;
  }

  return (
    <Tag
      className={cn(
        "rich-text-content",
        RICH_TEXT_FORMAT_CLASS,
        "[&_a]:text-primary [&_a]:underline",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
