import type { MaterialChapterView } from "@/lib/catalog/detail-queries";

type MaterialContentProps = {
  chapters: MaterialChapterView[];
};

export function MaterialContent({ chapters }: MaterialContentProps) {
  const chaptersWithContent = chapters.filter((chapter) => chapter.contentText);

  if (chaptersWithContent.length === 0) {
    return null;
  }

  return (
    <section id="material-content" className="space-y-6 scroll-mt-24">
      <h2 className="text-lg font-semibold text-foreground">Текст материала</h2>
      <ol className="flex flex-col gap-6">
        {chaptersWithContent.map((chapter) => (
          <li key={chapter.id} id={`chapter-${chapter.id}`} className="scroll-mt-24">
            <article className="rounded-xl border border-neutral-200 bg-white px-4 py-5 sm:px-6">
              <h3 className="text-base font-semibold text-foreground">
                <span className="mr-2 text-neutral-400">{chapter.position + 1}.</span>
                {chapter.title}
              </h3>
              <div className="mt-4 whitespace-pre-wrap text-sm leading-6 text-neutral-700">
                {chapter.contentText}
              </div>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}
