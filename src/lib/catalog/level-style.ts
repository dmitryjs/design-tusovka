import type { LucideIcon } from "lucide-react";
import { SignalHigh, SignalLow, SignalMedium } from "lucide-react";

import type { Database } from "@/types/database.types";

import { getLevelDifficultyLabel } from "./format";

type LevelStyle = {
  Icon: LucideIcon;
  className: string;
  label: string;
};

const LEVEL_STYLES: Record<
  Exclude<Database["public"]["Enums"]["designer_level"], "all">,
  Omit<LevelStyle, "label">
> = {
  junior: {
    Icon: SignalLow,
    className: "text-emerald-600",
  },
  middle: {
    Icon: SignalMedium,
    className: "text-amber-600",
  },
  senior: {
    Icon: SignalHigh,
    className: "text-rose-600",
  },
};

export function resolveLevelStyle(
  level: Database["public"]["Enums"]["designer_level"] | undefined,
): LevelStyle | null {
  if (!level || level === "all") {
    return null;
  }

  const style = LEVEL_STYLES[level];

  return {
    ...style,
    label: getLevelDifficultyLabel(level),
  };
}
