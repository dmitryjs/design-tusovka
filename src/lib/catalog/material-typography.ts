/** Body-текст в блоках материала: 16px, line-height 140%. */
export const materialBodyType = "text-base leading-[1.4]";

/** Внутренние отступы callout: базовые значения ×1.5 */
export const calloutLayout = {
  reading: "rounded-lg px-[18px] py-3",
  default: "rounded-xl border px-6 py-6 sm:px-[30px]",
  body: "flex gap-[18px]",
  titleToText: "mt-1.5",
} as const;