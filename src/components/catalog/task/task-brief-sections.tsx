"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

type BriefSection = {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
};

type TaskBriefSectionsProps = {
  sections: BriefSection[];
  defaultOpenId?: string;
};

function BriefAccordionItem({
  section,
  isOpen,
  onToggle,
}: {
  section: BriefSection;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-neutral-200 last:border-b-0">
      <button
        type="button"
        id={`${section.id}-trigger`}
        aria-expanded={isOpen}
        aria-controls={`${section.id}-panel`}
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-neutral-50 sm:px-5"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
          {section.icon}
        </span>
        <span className="flex-1 text-sm font-semibold text-foreground">{section.title}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-neutral-400 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      <div
        id={`${section.id}-panel`}
        role="region"
        aria-labelledby={`${section.id}-trigger`}
        hidden={!isOpen}
        className="px-4 pb-4 sm:px-5 sm:pb-5"
      >
        <div className="ml-12 text-sm leading-6 text-neutral-700">{section.content}</div>
      </div>
    </div>
  );
}

export function TaskBriefSections({ sections, defaultOpenId }: TaskBriefSectionsProps) {
  const [openId, setOpenId] = useState(defaultOpenId ?? sections[0]?.id ?? "");

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
        <BriefAccordionItem
          key={section.id}
          section={section}
          isOpen={openId === section.id}
          onToggle={() => setOpenId((current) => (current === section.id ? "" : section.id))}
        />
      ))}
    </section>
  );
}

export type { BriefSection };
