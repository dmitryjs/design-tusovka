import type { CartItemView } from "@/lib/cart/types";
import {
  getKindLabel,
  getLevelLabel,
  getMaterialFormatLabel,
} from "@/lib/catalog/format";

export function cartProductCountLabel(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return `${count} товар`;
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return `${count} товара`;
  }

  return `${count} товаров`;
}

export function getCheckoutItemSubtitle(item: CartItemView): string {
  if (item.kind === "material" && item.materialFormat) {
    return `${getMaterialFormatLabel(item.materialFormat)} • Доступ навсегда`;
  }

  if (item.kind === "task" && item.taskLevel && item.taskLevel !== "all") {
    return `${getKindLabel(item.kind)} • ${getLevelLabel(item.taskLevel)}`;
  }

  return `${getKindLabel(item.kind)} • Доступ навсегда`;
}
