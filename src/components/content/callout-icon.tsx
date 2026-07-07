import {
  CALLOUT_ICONS,
  parseCalloutIconValue,
} from "@/lib/content/callout-icons";
import { cn } from "@/lib/utils";

type CalloutGlyphProps = {
  icon: string | null | undefined;
  className?: string;
  iconClassName?: string;
  emojiClassName?: string;
};

export function CalloutGlyph({
  icon,
  className,
  iconClassName,
  emojiClassName,
}: CalloutGlyphProps) {
  const parsed = parseCalloutIconValue(icon);

  if (parsed.kind === "emoji") {
    return (
      <span
        className={cn(
          "inline-flex size-5 shrink-0 items-center justify-center text-[1.125rem] leading-none",
          emojiClassName,
          className,
        )}
        aria-hidden
      >
        {parsed.emoji}
      </span>
    );
  }

  if (parsed.kind === "lucide") {
    const Icon = CALLOUT_ICONS[parsed.id];
    return <Icon className={cn("size-5 shrink-0", iconClassName, className)} aria-hidden />;
  }

  return null;
}

/** @deprecated Используйте CalloutGlyph */
export function CalloutIcon({
  icon,
  className,
}: {
  icon: string | null | undefined;
  className?: string;
}) {
  return <CalloutGlyph icon={icon} iconClassName={className} />;
}
