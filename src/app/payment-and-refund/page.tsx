import {
  LegalPageLayout,
  LegalPlaceholder,
  LegalSection,
} from "@/components/legal/legal-page-layout";
import { SELLER_INFO } from "@/lib/legal/seller-info";

export const dynamic = "force-dynamic";

export default function PaymentAndRefundPage() {
  return (
    <LegalPageLayout
      title="Оплата и возврат"
      description="Условия оплаты цифровых материалов и порядок возврата средств."
    >
      <LegalSection title="Способы оплаты">
        <p>
          Оплата принимается банковской картой и через СБП с использованием платёжного
          сервиса ЮKassa. Платёжные данные карты обрабатываются на стороне ЮKassa.
        </p>
      </LegalSection>

      <LegalSection title="Предоставление доступа">
        <p>
          Доступ к цифровым материалам предоставляется в личном кабинете после
          подтверждения оплаты на сервере (webhook от платёжной системы).
        </p>
        <p>
          Страница успешного возврата с платёжной формы{" "}
          <strong>не является</strong> подтверждением оплаты. Если статус заказа ещё
          «ожидает оплаты», дождитесь обработки платежа или обратитесь в поддержку.
        </p>
      </LegalSection>

      <LegalSection title="Возврат средств">
        <p>
          Для запроса возврата напишите в поддержку:{" "}
          <a
            href={`mailto:${SELLER_INFO.supportEmail}`}
            className="underline-offset-2 hover:underline"
          >
            {SELLER_INFO.supportEmail}
          </a>
          .
        </p>
        <p>
          Если доступ к материалам уже был предоставлен, возврат рассматривается
          индивидуально с учётом факта использования цифрового контента.
        </p>
      </LegalSection>

      <LegalSection title="Сроки ответа">
        <p>
          Срок ответа поддержки по вопросам оплаты и возврата:{" "}
          <LegalPlaceholder>до N рабочих дней</LegalPlaceholder>.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
