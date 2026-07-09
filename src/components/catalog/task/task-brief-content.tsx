import type { TaskDetail } from "@/lib/catalog/detail-queries";

import type { BriefSection } from "./task-brief-sections";

type ParsedBriefBlock = {
  id: string;
  title: string;
  items: string[];
};

function renderInlineMarkdown(text: string): React.ReactNode {
  const normalized = text.trim();
  if (!normalized) {
    return null;
  }

  const chunks = normalized.split(/(\*\*[^*]+\*\*)/g);

  return chunks.map((chunk, index) => {
    if (chunk.startsWith("**") && chunk.endsWith("**") && chunk.length > 4) {
      return <strong key={index}>{chunk.slice(2, -2)}</strong>;
    }

    return <span key={index}>{chunk}</span>;
  });
}

function normalizeLine(raw: string): string {
  return raw.trim().replace(/^[-*]\s+/, "");
}

function toIdPart(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function parseBriefBlocks(lines: string[]): ParsedBriefBlock[] {
  const blocks: ParsedBriefBlock[] = [];
  let current: ParsedBriefBlock | null = null;

  for (const rawLine of lines) {
    const line = normalizeLine(rawLine);
    if (!line) {
      continue;
    }

    const headingMatch = line.match(/^##\s+(.+)$/);
    if (headingMatch) {
      const title = headingMatch[1].trim();
      current = {
        id: `task-brief-${toIdPart(title) || "section"}`,
        title,
        items: [],
      };
      blocks.push(current);
      continue;
    }

    if (!current) {
      current = {
        id: "task-brief-details",
        title: "Детали",
        items: [],
      };
      blocks.push(current);
    }

    current.items.push(line);
  }

  return blocks;
}

function renderParsedBrief(lines: string[]): React.ReactNode {
  const blocks = parseBriefBlocks(lines);

  if (!blocks.length) {
    return <p className="text-neutral-500">Информация будет добавлена позже.</p>;
  }

  return (
    <div className="space-y-6">
      {blocks.map((block) => (
        <section key={block.id} id={block.id} className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">{block.title}</h3>
          {block.items.length ? (
            <ul className="list-disc space-y-2 pl-5">
              {block.items.map((item, index) => (
                <li key={`${block.id}-${index}`}>{renderInlineMarkdown(item)}</li>
              ))}
            </ul>
          ) : (
            <p className="text-neutral-500">Раздел будет дополнен позже.</p>
          )}
        </section>
      ))}
    </div>
  );
}

function renderSimpleList(items: string[]) {
  const normalized = items
    .map((item) => normalizeLine(item))
    .filter((item) => item.length > 0);

  if (!normalized.length) {
    return <p className="text-neutral-500">Информация будет добавлена позже.</p>;
  }

  return (
    <ul className="list-disc space-y-2 pl-5">
      {normalized.map((item, index) => (
        <li key={index}>{renderInlineMarkdown(item)}</li>
      ))}
    </ul>
  );
}

export function buildTaskBriefSections(task: TaskDetail): BriefSection[] {
  const sections: BriefSection[] = [];

  sections.push({
    id: "task-brief-steps",
    title: "Что нужно сделать",
    content: renderParsedBrief(task.brief),
  });

  sections.push({
    id: "task-brief-constraints",
    title: "Ограничения",
    content: (
      <ul className="list-disc space-y-2 pl-5">
        <li>Работайте самостоятельно и опирайтесь на материалы брифа.</li>
        <li>Соблюдайте указанные форматы и объём сдачи.</li>
        <li>Черновики решения на платформе не сохраняются.</li>
      </ul>
    ),
  });

  sections.push({
    id: "task-brief-submit",
    title: "Что сдавать",
    content: renderSimpleList(task.submissionRequirements),
  });

  if (task.aiCriteria.length > 0) {
    sections.push({
      id: "task-brief-criteria",
      title: "Критерии оценки",
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
