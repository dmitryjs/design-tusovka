import Link from "next/link";
import { FileUp } from "lucide-react";

import { CalloutIcon } from "@/components/content/callout-icon";
import { CheckedListMarker } from "@/components/content/checked-list-marker";

import { Button, buttonVariants } from "@/components/ui/button";
import type { MaterialBlock } from "@/lib/content/material-blocks";
import { getMaterialBlockAnchorId } from "@/lib/content/material-reading";
import { RichTextContent } from "@/lib/content/rich-text-content";
import { normalizeTableRows } from "@/lib/content/table-utils";
import { cn } from "@/lib/utils";

type RenderVariant = "default" | "reading";

type MaterialBlockRendererProps = {
  blocks: MaterialBlock[];
  className?: string;
  variant?: RenderVariant;
};

function Callout({
  variant,
  title,
  text,
  icon,
  renderVariant,
}: {
  variant: "info" | "warning" | "success";
  title?: string;
  text: string;
  icon?: string | null;
  renderVariant: RenderVariant;
}) {
  const styles = {
    info: "bg-blue-50 text-blue-900",
    warning: "bg-amber-50 text-amber-950",
    success: "bg-emerald-50 text-emerald-950",
  } as const;

  const iconToneClass = {
    info: "text-blue-600",
    warning: "text-amber-700",
    success: "text-emerald-700",
  } as const;

  const body = (
    <div className="flex gap-3">
      <CalloutIcon icon={icon} className={cn("mt-0.5", iconToneClass[variant])} />
      <div className="min-w-0 flex-1">
        {title ? (
          <p className={cn("text-sm", renderVariant === "reading" ? "font-medium" : "font-semibold")}>
            {title}
          </p>
        ) : null}
        {text ? (
          <RichTextContent
            as="p"
            html={text}
            className={cn("text-sm leading-6", title && "mt-1")}
          />
        ) : null}
      </div>
    </div>
  );

  if (renderVariant === "reading") {
    return <div className={cn("rounded-lg px-3 py-2", styles[variant])}>{body}</div>;
  }

  return <div className={cn("rounded-xl border px-4 py-4 sm:px-5", styles[variant])}>{body}</div>;
}

function MaterialBlockItem({
  block,
  variant,
}: {
  block: MaterialBlock;
  variant: RenderVariant;
}) {
  const isReading = variant === "reading";
  const isHeading =
    block.type === "heading1" || block.type === "heading2" || block.type === "heading3";
  const headingAnchorProps = isHeading
    ? {
        id: getMaterialBlockAnchorId(block.id),
        className: "scroll-mt-24",
      }
    : {};

  switch (block.type) {
    case "heading1":
      return (
        <h2
          {...headingAnchorProps}
          className={cn(
            "text-2xl leading-8 font-semibold text-foreground",
            headingAnchorProps.className,
          )}
        >
          <RichTextContent html={block.data.text} />
        </h2>
      );
    case "heading2":
      return (
        <h3
          {...headingAnchorProps}
          className={cn(
            "text-xl leading-7 font-semibold text-foreground",
            headingAnchorProps.className,
          )}
        >
          <RichTextContent html={block.data.text} />
        </h3>
      );
    case "heading3":
      return (
        <h4
          {...headingAnchorProps}
          className={cn(
            "text-lg leading-7 font-semibold text-foreground",
            headingAnchorProps.className,
          )}
        >
          <RichTextContent html={block.data.text} />
        </h4>
      );
    case "paragraph":
      return (
        <RichTextContent
          as="p"
          html={block.data.text}
          className="whitespace-pre-wrap text-sm leading-6 text-neutral-700"
        />
      );
    case "bulleted_list":
      return (
        <ul
          className={cn(
            "text-sm leading-6 text-neutral-700",
            isReading ? "space-y-1 pl-5" : "list-disc space-y-2 pl-5",
          )}
        >
          {block.data.items.filter(Boolean).map((item, index) => (
            <li key={index} className={isReading ? "list-disc" : undefined}>
              <RichTextContent html={item} />
            </li>
          ))}
        </ul>
      );
    case "numbered_list":
      return (
        <ol
          className={cn(
            "text-sm leading-6 text-neutral-700",
            isReading ? "space-y-1 pl-5" : "list-decimal space-y-2 pl-5",
          )}
        >
          {block.data.items.filter(Boolean).map((item, index) => (
            <li key={index} className={isReading ? "list-decimal" : undefined}>
              <RichTextContent html={item} />
            </li>
          ))}
        </ol>
      );
    case "checklist":
      return (
        <ul className={cn("text-sm leading-6 text-neutral-700", isReading ? "space-y-1" : "space-y-2")}>
          {block.data.items.map((item) => (
            <li key={item.id} className="flex items-start gap-2">
              <span aria-hidden>{item.checked ? "☑" : "☐"}</span>
              <RichTextContent html={item.text} />
            </li>
          ))}
        </ul>
      );
    case "checked_list":
      return (
        <ul
          className={cn(
            "text-sm leading-6 text-neutral-700",
            isReading ? "space-y-2" : "space-y-2.5",
          )}
        >
          {block.data.items.filter(Boolean).map((item, index) => (
            <li key={index} className="flex items-start gap-2.5">
              <CheckedListMarker />
              <RichTextContent html={item} className="min-w-0 flex-1" />
            </li>
          ))}
        </ul>
      );
    case "quote":
      return (
        <blockquote
          className={cn(
            "border-l-4 border-primary bg-blue-50 px-4 py-3 text-sm leading-6 text-primary",
            isReading ? "rounded-r-lg" : "rounded-r-xl py-4",
          )}
        >
          <RichTextContent as="p" html={block.data.text} />
          {block.data.author ? (
            <footer className="mt-2 text-primary/70">— {block.data.author}</footer>
          ) : null}
        </blockquote>
      );
    case "image":
      return block.data.url ? (
        <figure>
          <div className={cn(!isReading && "overflow-hidden rounded-xl")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={block.data.url}
              alt={block.data.alt || ""}
              className="h-auto max-h-[720px] w-full object-contain"
            />
          </div>
          {block.data.caption ? (
            <figcaption className="mt-2 text-sm text-neutral-500">{block.data.caption}</figcaption>
          ) : null}
        </figure>
      ) : null;
    case "video":
      return block.data.url ? (
        <figure className="space-y-2">
          <div
            className={cn(
              "aspect-video overflow-hidden bg-neutral-100",
              isReading ? "rounded-lg" : "rounded-xl",
            )}
          >
            <iframe
              src={block.data.url}
              title={block.data.caption || "Видео"}
              className="h-full w-full"
              allowFullScreen
            />
          </div>
          {block.data.caption ? (
            <figcaption className="text-sm text-neutral-500">{block.data.caption}</figcaption>
          ) : null}
        </figure>
      ) : null;
    case "table": {
      const rows = normalizeTableRows(block.data.rows);
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="min-w-[80px] border border-neutral-200 px-3 py-2 align-top text-neutral-700"
                    >
                      <RichTextContent html={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case "file":
      return block.data.url ? (
        <a
          href={block.data.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex max-w-full items-center gap-2 text-sm text-foreground hover:underline"
        >
          <FileUp className="size-4 shrink-0 text-neutral-500" />
          <span className="truncate">{block.data.name || "Файл"}</span>
          {block.data.sizeLabel ? (
            <span className="shrink-0 text-neutral-400">{block.data.sizeLabel}</span>
          ) : null}
        </a>
      ) : null;
    case "embed":
      return block.data.url ? (
        <a
          href={block.data.url}
          target="_blank"
          rel="noreferrer"
          className={cn(
            "block text-sm text-foreground hover:underline",
            !isReading && "rounded-xl border border-neutral-200 px-4 py-4 hover:bg-neutral-50",
          )}
        >
          <p className="font-medium">{block.data.title || block.data.url}</p>
          {block.data.description ? (
            <p className="mt-1 text-neutral-600">{block.data.description}</p>
          ) : null}
        </a>
      ) : null;
    case "callout_info":
      return (
        <Callout
          variant="info"
          title={block.data.title}
          text={block.data.text}
          icon={block.data.icon}
          renderVariant={variant}
        />
      );
    case "callout_warning":
      return (
        <Callout
          variant="warning"
          title={block.data.title}
          text={block.data.text}
          icon={block.data.icon}
          renderVariant={variant}
        />
      );
    case "callout_success":
      return (
        <Callout
          variant="success"
          title={block.data.title}
          text={block.data.text}
          icon={block.data.icon}
          renderVariant={variant}
        />
      );
    case "divider":
      return <hr className="border-neutral-200" />;
    case "accordion":
      return (
        <details
          className={cn(
            isReading ? "py-1" : "rounded-xl border border-neutral-200 px-4 py-3",
          )}
        >
          <summary className="cursor-pointer text-sm font-semibold text-foreground">
            {block.data.title}
          </summary>
          <RichTextContent
            as="p"
            html={block.data.text}
            className="mt-3 text-sm leading-6 text-neutral-700"
          />
        </details>
      );
    case "cta":
      return (
        <div className={cn("bg-blue-50 px-5 py-5", isReading ? "rounded-lg" : "rounded-xl border border-blue-100")}>
          <h3 className="text-base font-semibold text-foreground">{block.data.title}</h3>
          {block.data.description ? (
            <p className="mt-2 text-sm leading-6 text-neutral-600">{block.data.description}</p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            {block.data.primaryUrl ? (
              <Link href={block.data.primaryUrl} className={buttonVariants()}>
                {block.data.primaryLabel}
              </Link>
            ) : (
              <Button disabled>{block.data.primaryLabel}</Button>
            )}
            {block.data.secondaryLabel ? (
              block.data.secondaryUrl ? (
                <Link
                  href={block.data.secondaryUrl}
                  className={buttonVariants({ variant: "outline" })}
                >
                  {block.data.secondaryLabel}
                </Link>
              ) : (
                <Button variant="outline" disabled>
                  {block.data.secondaryLabel}
                </Button>
              )
            ) : null}
          </div>
        </div>
      );
    default:
      return null;
  }
}

export function MaterialBlockRenderer({
  blocks,
  className,
  variant = "default",
}: MaterialBlockRendererProps) {
  if (!blocks.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-col",
        variant === "reading" ? "gap-0.5" : "gap-6",
        className,
      )}
    >
      {blocks.map((block) => (
        <div key={block.id} className={variant === "reading" ? "py-0.5" : undefined}>
          <MaterialBlockItem block={block} variant={variant} />
        </div>
      ))}
    </div>
  );
}
