const ORDER_NUMBER_PREFIX = "DT-";
const ORDER_ID_SHORT_LENGTH = 8;

/**
 * Стабильный публичный номер заказа для описания платежа и чеков.
 * Primary key не меняется: номер выводится из `order.id` детерминированно.
 */
export function buildPublicOrderNumber(orderId: string): string {
  return `${ORDER_NUMBER_PREFIX}${orderId.slice(0, ORDER_ID_SHORT_LENGTH).toUpperCase()}`;
}
