import type { ClaimFreeProductCode } from "./types";

const CLAIM_MESSAGES: Record<ClaimFreeProductCode, string> = {
  claimed: "Добавлено в библиотеку.",
  already_claimed: "Уже в вашей библиотеке.",
  unauthenticated: "Войдите в аккаунт, чтобы сохранить продукт.",
  not_found: "Продукт не найден или снят с публикации.",
  not_free: "Этот продукт нельзя получить бесплатно.",
  unsupported_kind: "Бесплатное получение доступно для материалов, заданий и разделов.",
  rpc_error: "Не удалось сохранить продукт. Попробуйте позже.",
};

export function getClaimFreeProductMessage(code: ClaimFreeProductCode): string {
  return CLAIM_MESSAGES[code];
}
