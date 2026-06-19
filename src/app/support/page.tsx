import {
  LegalMailto,
  LegalPageLayout,
  LegalSection,
} from "@/components/legal/legal-page-layout";
import { getSupportResponseText, SELLER_INFO } from "@/lib/legal/seller-info";

export const dynamic = "force-dynamic";

export default function SupportPage() {
  return (
    <LegalPageLayout
      title="Поддержка"
      description="Контакты и темы обращений по сервису «Дизайн Тусовка»."
    >
      <p>
        Если у вас возник вопрос по сайту «Дизайн Тусовка», напишите нам на email:{" "}
        <LegalMailto />.
      </p>

      <LegalSection title="По каким вопросам можно обращаться">
        <p>Мы помогаем с вопросами:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>регистрация и вход;</li>
          <li>доступ к личному кабинету;</li>
          <li>получение бесплатных материалов;</li>
          <li>доступ к оплаченным материалам;</li>
          <li>ошибки при оплате;</li>
          <li>списание денег без выдачи доступа;</li>
          <li>возвраты;</li>
          <li>ошибки в материалах;</li>
          <li>технические проблемы на сайте.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Что указать в обращении">
        <p>Чтобы мы быстрее разобрались, укажите:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>email аккаунта;</li>
          <li>номер заказа, если вопрос связан с оплатой;</li>
          <li>название материала;</li>
          <li>дату оплаты;</li>
          <li>описание проблемы;</li>
          <li>скриншот ошибки, если он есть.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Срок ответа">
        <p>Обычно мы отвечаем в течение {getSupportResponseText()}.</p>
        <p>
          Если вопрос связан с платежом или возвратом, проверка может занять до{" "}
          {SELLER_INFO.refundReviewDays}.
        </p>
      </LegalSection>

      <LegalSection title="Если доступ не появился после оплаты">
        <p>
          Напишите на <LegalMailto /> и укажите номер заказа.
        </p>
        <p>
          Мы проверим статус платежа в ЮKassa и откроем доступ, если оплата подтверждена.
        </p>
      </LegalSection>

      <LegalSection title="Если нашли ошибку в материале">
        <p>
          Напишите нам название материала, страницу или фрагмент, где нашли ошибку.
        </p>
        <p>
          Мы проверим материал и внесём исправления, если ошибка подтвердится.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
