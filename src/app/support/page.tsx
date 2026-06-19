import {
  LegalPageLayout,
  LegalPlaceholder,
  LegalSection,
} from "@/components/legal/legal-page-layout";
import { SELLER_INFO } from "@/lib/legal/seller-info";

export const dynamic = "force-dynamic";

export default function SupportPage() {
  return (
    <LegalPageLayout
      title="Поддержка"
      description="Контакты и темы обращений по сервису «Дизайн Тусовка»."
    >
      <LegalSection title="Email">
        <p>
          <a
            href={`mailto:${SELLER_INFO.supportEmail}`}
            className="text-neutral-800 underline-offset-2 hover:underline"
          >
            {SELLER_INFO.supportEmail}
          </a>
        </p>
      </LegalSection>

      <LegalSection title="По каким вопросам писать">
        <ul className="list-disc space-y-2 pl-5">
          <li>Оплата заказов и статус платежа.</li>
          <li>Доступ к материалам и заданиям в личном кабинете.</li>
          <li>Возврат средств и спорные ситуации по заказам.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Время ответа">
        <p>
          Ориентировочный срок ответа:{" "}
          <LegalPlaceholder>до N рабочих дней</LegalPlaceholder>. Укажите в письме
          email аккаунта и номер заказа, если вопрос связан с оплатой.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
