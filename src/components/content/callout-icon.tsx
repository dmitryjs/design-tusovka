import { resolveCalloutIcon } from "@/lib/content/callout-icons";
import { cn } from "@/lib/utils";

type CalloutIconProps = {
  icon: string | null | undefined;
  className?: string;
};

export function CalloutIcon({ icon, className }: CalloutIconProps) {
  const Icon = resolveCalloutIcon(icon);

  if (!Icon) {
    return null;
  }

  return <Icon className={cn("size-5 shrink-0", className)} aria-hidden />;
}
