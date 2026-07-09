import { cn } from "@/lib/utils";

type BriefSection = {
  id: string;
  title: string;
  content: React.ReactNode;
};

type TaskBriefSectionsProps = {
  sections: BriefSection[];
};

export function TaskBriefSections({ sections }: TaskBriefSectionsProps) {
  if (!sections.length) {
    return null;
  }

  return (
    <section
      id="task-brief"
      aria-label="Бриф задания"
      className="overflow-hidden rounded-xl border border-neutral-200 bg-white"
    >
      {sections.map((section) => (
        <article
          key={section.id}
          id={section.id}
          className={cn("border-b border-neutral-200 px-4 py-5 sm:px-5 last:border-b-0")}
        >
          <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
          <div className="mt-4 text-sm leading-7 text-neutral-700">{section.content}</div>
        </article>
      ))}
    </section>
  );
}

export type { BriefSection };
