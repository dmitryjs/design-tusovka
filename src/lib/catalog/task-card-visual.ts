import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  Layers,
  LayoutGrid,
  Lightbulb,
  MousePointer2,
  Palette,
  PenLine,
  PenTool,
  Rocket,
  Sparkles,
  Target,
} from "lucide-react";

type TaskCardVisual = {
  Icon: LucideIcon;
  iconClassName: string;
  containerClassName: string;
};

const TASK_CARD_VISUALS: TaskCardVisual[] = [
  {
    Icon: ClipboardList,
    iconClassName: "text-blue-600",
    containerClassName: "bg-blue-50",
  },
  {
    Icon: PenLine,
    iconClassName: "text-violet-600",
    containerClassName: "bg-violet-50",
  },
  {
    Icon: Palette,
    iconClassName: "text-rose-600",
    containerClassName: "bg-rose-50",
  },
  {
    Icon: LayoutGrid,
    iconClassName: "text-emerald-600",
    containerClassName: "bg-emerald-50",
  },
  {
    Icon: Sparkles,
    iconClassName: "text-amber-600",
    containerClassName: "bg-amber-50",
  },
  {
    Icon: Target,
    iconClassName: "text-sky-600",
    containerClassName: "bg-sky-50",
  },
  {
    Icon: Rocket,
    iconClassName: "text-orange-600",
    containerClassName: "bg-orange-50",
  },
  {
    Icon: Lightbulb,
    iconClassName: "text-teal-600",
    containerClassName: "bg-teal-50",
  },
  {
    Icon: Layers,
    iconClassName: "text-indigo-600",
    containerClassName: "bg-indigo-50",
  },
  {
    Icon: PenTool,
    iconClassName: "text-fuchsia-600",
    containerClassName: "bg-fuchsia-50",
  },
  {
    Icon: MousePointer2,
    iconClassName: "text-cyan-600",
    containerClassName: "bg-cyan-50",
  },
];

const TITLE_KEYWORD_VISUALS: Array<{
  pattern: RegExp;
  visual: TaskCardVisual;
}> = [
  {
    pattern: /онборд|onboard|welcome|перв/i,
    visual: TASK_CARD_VISUALS[6]!,
  },
  {
    pattern: /кейс|case|портфолио|portfolio/i,
    visual: TASK_CARD_VISUALS[1]!,
  },
  {
    pattern: /ui|ux|интерфейс|макет|экран/i,
    visual: TASK_CARD_VISUALS[2]!,
  },
  {
    pattern: /research|исслед|интервью|опрос/i,
    visual: TASK_CARD_VISUALS[5]!,
  },
  {
    pattern: /ai|нейро|prompt|промпт/i,
    visual: TASK_CARD_VISUALS[4]!,
  },
  {
    pattern: /систем|design system|компонент/i,
    visual: TASK_CARD_VISUALS[8]!,
  },
  {
    pattern: /продукт|product|метрик|metric/i,
    visual: TASK_CARD_VISUALS[3]!,
  },
];

function hashString(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

export function resolveTaskCardVisual(slug: string, title: string): TaskCardVisual {
  for (const entry of TITLE_KEYWORD_VISUALS) {
    if (entry.pattern.test(title)) {
      return entry.visual;
    }
  }

  const index = hashString(`${slug}:${title}`) % TASK_CARD_VISUALS.length;
  return TASK_CARD_VISUALS[index]!;
}
