import { Info } from "lucide-react";

type TaskInfoBannerProps = {
  aiReviewAvailable: boolean;
  manualReviewAvailable: boolean;
};

export function TaskInfoBanner({
  aiReviewAvailable,
  manualReviewAvailable,
}: TaskInfoBannerProps) {
  let feedbackText = "Обратная связь будет доступна после отправки решения.";

  if (aiReviewAvailable && manualReviewAvailable) {
    feedbackText =
      "После отправки можно получить AI-разбор бесплатно или заказать экспертную проверку.";
  } else if (aiReviewAvailable) {
    feedbackText =
      "После отправки решения доступна бесплатная AI-проверка по критериям задания.";
  } else if (manualReviewAvailable) {
    feedbackText =
      "После отправки решения можно заказать экспертную проверку от наставника.";
  }

  return (
    <div
      className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-4 sm:px-5"
      role="note"
    >
      <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">Это практическое задание</p>
        <p className="text-sm leading-6 text-neutral-600">{feedbackText}</p>
      </div>
    </div>
  );
}
