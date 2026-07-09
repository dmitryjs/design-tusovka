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
    <section id="task-brief" aria-label="Бриф задания">
      {sections.map((section) => (
        <article
          key={section.id}
          id={section.id}
          className={cn("py-5", "border-b border-neutral-200 last:border-b-0")}
        >
          <h2 className="text-3xl font-semibold text-foreground">{section.title}</h2>
          <div className="mt-4 text-sm leading-7 text-neutral-700">{section.content}</div>
        </article>
      ))}
    </section>
  );
}

export type { BriefSection };
