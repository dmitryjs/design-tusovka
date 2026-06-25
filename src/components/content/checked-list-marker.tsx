import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

type CheckedListMarkerProps = {
  className?: string;
};

export function CheckedListMarker({ className }: CheckedListMarkerProps) {
  return (
    <span
      className={cn(
        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground",
        className,
      )}
      aria-hidden
    >
      <Check className="size-3" strokeWidth={3} />
    </span>
  );
}
