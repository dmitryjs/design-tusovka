"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  grantManualAccessAction,
  revokeEntitlementAction,
  setUserDeactivatedAction,
} from "@/app/actions/admin/users";
import { AdminAlert } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAdminProductKindLabel } from "@/lib/admin/product-kind";
import { getLevelLabel } from "@/lib/catalog/format";
import type { AdminUserDetail } from "@/lib/admin/users";
import { cn } from "@/lib/utils";

type UserDetailPanelProps = {
  user: AdminUserDetail;
  products: Array<{ id: string; title: string; slug: string; kind: string }>;
};

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function UserDetailPanel({ user, products }: UserDetailPanelProps) {
  const router = useRouter();
  const [message, setMessage] = useState<{ variant: "error" | "success"; text: string } | null>(
    null,
  );
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();

  function handleDeactivate(deactivated: boolean) {
    setMessage(null);
    startTransition(async () => {
      const result = await setUserDeactivatedAction(user.id, deactivated);
      if (!result.ok) {
        setMessage({ variant: "error", text: result.error ?? "Ошибка" });
        return;
      }
      setMessage({
        variant: "success",
        text: deactivated ? "Пользователь деактивирован" : "Пользователь активирован",
      });
      router.refresh();
    });
  }

  function handleGrantAccess() {
    if (!productId) {
      return;
    }

    setMessage(null);
    startTransition(async () => {
      const result = await grantManualAccessAction(user.id, productId);
      if (!result.ok) {
        setMessage({ variant: "error", text: result.error ?? "Ошибка" });
        return;
      }
      setMessage({ variant: "success", text: "Доступ выдан" });
      router.refresh();
    });
  }

  function handleRevoke(entitlementId: string) {
    setMessage(null);
    startTransition(async () => {
      const result = await revokeEntitlementAction(entitlementId, user.id);
      if (!result.ok) {
        setMessage({ variant: "error", text: result.error ?? "Ошибка" });
        return;
      }
      setMessage({ variant: "success", text: "Доступ отозван" });
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {message ? <AdminAlert variant={message.variant}>{message.text}</AdminAlert> : null}

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              {user.displayName?.trim() || "Без имени"}
            </h2>
            <p className="text-sm text-neutral-600">{user.email}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="border-0 bg-neutral-100">
                {user.role === "admin" ? "Админ" : "Пользователь"}
              </Badge>
              <Badge
                variant="secondary"
                className={cn(
                  "border-0",
                  user.deactivatedAt
                    ? "bg-neutral-100 text-neutral-600"
                    : "bg-emerald-50 text-emerald-700",
                )}
              >
                {user.deactivatedAt ? "Деактивирован" : "Активен"}
              </Badge>
            </div>
          </div>

          <Button
            type="button"
            variant={user.deactivatedAt ? "default" : "secondary"}
            disabled={isPending}
            onClick={() => handleDeactivate(!user.deactivatedAt)}
          >
            {user.deactivatedAt ? "Активировать" : "Деактивировать"}
          </Button>
        </div>

        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-neutral-500">Уровень</dt>
            <dd className="mt-1 font-medium text-foreground">
              {user.designerLevel !== "all"
                ? getLevelLabel(user.designerLevel)
                : "Не указан"}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">Telegram</dt>
            <dd className="mt-1 font-medium text-foreground">
              {user.telegramUsername ? `@${user.telegramUsername}` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">Регистрация</dt>
            <dd className="mt-1 font-medium text-foreground">
              {formatDateTime(user.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">Заказы</dt>
            <dd className="mt-1 font-medium text-foreground">{user.ordersCount}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <h3 className="text-base font-semibold text-foreground">Выдать доступ вручную</h3>
        <p className="mt-1 text-sm text-neutral-600">
          Добавляет entitlement с источником manual для опубликованного товара.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <select
            value={productId}
            onChange={(event) => setProductId(event.target.value)}
            disabled={isPending || products.length === 0}
            className="h-9 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-foreground"
          >
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.title} ({getAdminProductKindLabel(product.kind as "material" | "task" | "section" | "section_update")})
              </option>
            ))}
          </select>
          <Button
            type="button"
            disabled={isPending || !productId}
            onClick={handleGrantAccess}
            className="shrink-0"
          >
            Выдать доступ
          </Button>
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <h3 className="text-base font-semibold text-foreground">Доступы</h3>
        {user.entitlements.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-600">Активных и архивных доступов пока нет.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-neutral-200 text-neutral-600">
                <tr>
                  <th className="px-2 py-2 font-medium">Товар</th>
                  <th className="px-2 py-2 font-medium">Источник</th>
                  <th className="px-2 py-2 font-medium">Выдан</th>
                  <th className="px-2 py-2 font-medium">Статус</th>
                  <th className="px-2 py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {user.entitlements.map((item) => (
                  <tr key={item.id} className="border-b border-neutral-100 last:border-0">
                    <td className="px-2 py-3">
                      <p className="font-medium text-foreground">{item.productTitle}</p>
                      <p className="text-neutral-500">{getAdminProductKindLabel(item.productKind)}</p>
                    </td>
                    <td className="px-2 py-3 text-neutral-700">{item.sourceType}</td>
                    <td className="px-2 py-3 text-neutral-700">
                      {formatDateTime(item.grantedAt)}
                    </td>
                    <td className="px-2 py-3">
                      {item.revokedAt ? (
                        <span className="text-neutral-500">Отозван</span>
                      ) : (
                        <span className="text-emerald-700">Активен</span>
                      )}
                    </td>
                    <td className="px-2 py-3">
                      {!item.revokedAt ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleRevoke(item.id)}
                        >
                          Отозвать
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
