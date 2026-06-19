import {
  LegalPageLayout,
  LegalPlaceholder,
  LegalSection,
} from "@/components/legal/legal-page-layout";
import { SELLER_INFO } from "@/lib/legal/seller-info";

export const dynamic = "force-dynamic";

const LAST_UPDATED = "2026-06-19";

export default function OfferPage() {
  return (
    <LegalPageLayout
      title="Публичная оферта"
      description="Условия покупки цифровых материалов на сайте «Дизайн Тусовка»."
      draftNotice="Черновик. Перед запуском оплат текст нужно проверить с юристом."
    >
      <LegalSection title="1. Продавец">
        <p>
          Продавец: {SELLER_INFO.legalName}, ИНН {SELLER_INFO.inn}, ОГРНИП{" "}
          {SELLER_INFO.ogrnip}.
        </p>
      </LegalSection>

      <LegalSection title="2. Предмет оферты">
        <p>
          Продавец предоставляет Покупателю доступ к цифровым материалам, гайдам,
          шаблонам и заданиям для дизайнеров, размещённым на сайте «Дизайн Тусовка».
        </p>
      </LegalSection>

      <LegalSection title="3. Порядок покупки">
        <p>
          Покупатель выбирает платный продукт, добавляет его в корзину, оформляет
          заказ и оплачивает его через платёжный сервис ЮKassa. Цена указывается на
          сайте в рублях и определяется на момент оформления заказа.
        </p>
      </LegalSection>

      <LegalSection title="4. Предоставление доступа">
        <p>
          Доступ к оплаченному цифровому контенту предоставляется в личном кабинете
          после серверного подтверждения оплаты. Страница успешного возврата с
          платёжной формы не является подтверждением оплаты.
        </p>
      </LegalSection>

      <LegalSection title="5. Возвраты">
        <p>
          Возврат денежных средств возможен в случаях, предусмотренных законодательством
          РФ и настоящей офертой. Порядок возврата описан на странице{" "}
          <a href="/payment-and-refund" className="underline-offset-2 hover:underline">
            «Оплата и возврат»
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="6. Ответственность">
        <p>
          Продавец не несёт ответственности за невозможность доступа к материалам по
          причинам, не зависящим от Продавца, включая сбои у интернет-провайдера или
          оборудования Покупателя.
        </p>
      </LegalSection>

      <LegalSection title="7. Поддержка">
        <p>
          По вопросам заказов и доступа:{" "}
          <a
            href={`mailto:${SELLER_INFO.supportEmail}`}
            className="underline-offset-2 hover:underline"
          >
            {SELLER_INFO.supportEmail}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="8. Дата обновления">
        <p>Последнее обновление: {LAST_UPDATED}.</p>
      </LegalSection>
    </LegalPageLayout>
  );
}
