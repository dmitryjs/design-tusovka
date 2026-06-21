import { FileText, Lock, ShieldCheck } from "lucide-react";

export function CheckoutTrustPanel() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <div className="flex gap-3">
          <Lock className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">Безопасная оплата</p>
            <p className="text-xs leading-5 text-neutral-600">
              Платёж проходит через ЮKassa. Данные карты не сохраняются на нашем сервере.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <div className="flex gap-3">
          <FileText className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">Электронный чек</p>
            <p className="text-xs leading-5 text-neutral-600">
              Чек придёт на email, указанный в аккаунте, после подтверждения оплаты.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">После оплаты вы получите</p>
            <ul className="space-y-1.5 text-xs leading-5 text-neutral-600">
              <li className="flex gap-2">
                <span className="text-primary" aria-hidden>
                  ✓
                </span>
                Мгновенный доступ к материалам в библиотеке
              </li>
              <li className="flex gap-2">
                <span className="text-primary" aria-hidden>
                  ✓
                </span>
                Чек на email
              </li>
              <li className="flex gap-2">
                <span className="text-primary" aria-hidden>
                  ✓
                </span>
                Возможность скачивать вложения
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
