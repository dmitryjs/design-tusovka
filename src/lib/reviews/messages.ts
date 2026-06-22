import type { ReviewMutationCode } from "./types";

const MESSAGES: Record<ReviewMutationCode, string> = {
  saved: "Отзыв сохранён.",
  deleted: "Отзыв удалён.",
  unauthenticated: "Войдите в аккаунт, чтобы оставить отзыв.",
  invalid_rating: "Выберите оценку от 1 до 5.",
  empty_body: "Напишите текст отзыва.",
  body_too_long: "Отзыв слишком длинный (максимум 5000 символов).",
  not_entitled: "Оставить отзыв могут только те, кто получил этот продукт.",
  not_found: "Отзыв не найден.",
  rpc_error: "Не удалось выполнить действие. Попробуйте позже.",
};

export function getReviewMutationMessage(code: ReviewMutationCode): string {
  return MESSAGES[code];
}

export function reviewCountLabel(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return `${count} отзыв`;
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return `${count} отзыва`;
  }

  return `${count} отзывов`;
}
