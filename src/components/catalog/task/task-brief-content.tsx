import {
  AlertCircle,
  CheckSquare,
  ClipboardList,
  FileText,
  Layers,
  Upload,
} from "lucide-react";

import type { TaskDetail } from "@/lib/catalog/detail-queries";

import type { BriefSection } from "./task-brief-sections";

function renderList(items: string[]) {
  if (!items.length) {
    return <p className="text-neutral-500">Информация будет добавлена позже.</p>;
  }

  return (
    <ul className="list-disc space-y-2 pl-4">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

export function buildTaskBriefSections(task: TaskDetail): BriefSection[] {
  const sections: BriefSection[] = [];

  if (task.description) {
    sections.push({
      id: "task-brief-context",
      title: "Контекст",
      icon: <FileText className="size-4" aria-hidden />,
      content: <p>{task.description}</p>,
    });
  }

  sections.push({
    id: "task-brief-problem",
    title: "Проблема",
    icon: <AlertCircle className="size-4" aria-hidden />,
    content: (
      <p>
        {task.description ||
          "Определите пользовательскую проблему, которую нужно решить в рамках задания."}
      </p>
    ),
  });

  sections.push({
    id: "task-brief-steps",
    title: "Что нужно сделать",
    icon: <ClipboardList className="size-4" aria-hidden />,
    content: renderList(task.brief),
  });

  sections.push({
    id: "task-brief-constraints",
    title: "Ограничения",
    icon: <Layers className="size-4" aria-hidden />,
    content: (
      <ul className="list-disc space-y-2 pl-4">
        <li>Работайте самостоятельно и опирайтесь на материалы брифа.</li>
        <li>Соблюдайте указанные форматы и объём сдачи.</li>
        <li>Черновики решения на платформе не сохраняются.</li>
      </ul>
    ),
  });

  sections.push({
    id: "task-brief-submit",
    title: "Что сдавать",
    icon: <Upload className="size-4" aria-hidden />,
    content: renderList(task.submissionRequirements),
  });

  if (task.aiCriteria.length > 0) {
    sections.push({
      id: "task-brief-criteria",
      title: "Критерии оценки",
      icon: <CheckSquare className="size-4" aria-hidden />,
      content: (
        <ul className="space-y-3">
          {task.aiCriteria.map((criterion) => (
            <li key={criterion.id}>
              <p className="font-medium text-foreground">{criterion.title}</p>
              {criterion.description ? (
                <p className="mt-1 text-neutral-600">{criterion.description}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ),
    });
  }

  return sections;
}
