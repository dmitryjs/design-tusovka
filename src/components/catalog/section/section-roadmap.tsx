import type { SectionDetail } from "@/lib/catalog/detail-queries";

type SectionRoadmapProps = {
  steps: string[];
};

export function SectionRoadmap({ steps }: SectionRoadmapProps) {
  if (steps.length === 0) {
    return null;
  }

  const visibleSteps = steps.slice(0, 6);

  return (
    <section aria-label="Содержание раздела" className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Содержание раздела</h2>
      <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {visibleSteps.map((step, index) => (
          <li
            key={index}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-4"
          >
            <p className="text-xs font-semibold tracking-wide text-primary tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </p>
            <p className="mt-2 text-sm leading-5 font-medium text-foreground">{step}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function SectionRoadmapFromSection({ section }: { section: SectionDetail }) {
  const steps =
    section.whatYouGet.length > 0 ? section.whatYouGet : section.forWhom;

  return <SectionRoadmap steps={steps} />;
}
