import type { CartMutationCode } from "./types";

const MESSAGES: Record<CartMutationCode, string> = {
  added: "Товар добавлен в корзину.",
  already_in_cart: "Товар уже в корзине.",
  removed: "Товар удалён из корзины.",
  created: "Заказ создан.",
  cancelled: "Заказ отменён. Товары возвращены в корзину.",
  deleted: "Заказ удалён из списка.",
  unauthenticated: "Войдите в аккаунт, чтобы продолжить.",
  not_found: "Товар не найден.",
  free_product: "Бесплатные продукты получают через «Получить бесплатно».",
  already_owned: "Продукт уже в вашей библиотеке.",
  unsupported_kind: "Этот тип продукта нельзя добавить в корзину.",
  empty_cart: "Корзина пуста.",
  product_unavailable: "Один из товаров больше недоступен.",
  invalid_status: "Этот заказ нельзя отменить.",
  payment_in_progress: "Оплата уже обрабатывается. Дождитесь результата или обратитесь в поддержку.",
  rpc_error: "Не удалось выполнить операцию. Попробуйте позже.",
};

export function getCartMutationMessage(code: CartMutationCode): string {
  return MESSAGES[code];
}

export function getOrderStatusLabel(status: string): string {
  switch (status) {
    case "pending_payment":
      return "Ожидает оплаты";
    case "paid":
      return "Оплачен";
    case "cancelled":
      return "Отменён";
    case "failed":
      return "Ошибка оплаты";
    default:
      return status;
  }
}
