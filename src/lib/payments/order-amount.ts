import "server-only";

type OrderItemRow = {
  price_kopecks: number;
};

export function sumOrderItemsKopecks(items: OrderItemRow[]): number {
  return items.reduce((sum, item) => sum + item.price_kopecks, 0);
}
