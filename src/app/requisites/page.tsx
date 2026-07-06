import {
  LegalCorrespondenceAddress,
  LegalPageLayout,
  LegalSection,
} from "@/components/legal/legal-page-layout";
import { SELLER_INFO } from "@/lib/legal/seller-info";
import { getPublicSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export default function RequisitesPage() {
  const siteUrl = getPublicSiteUrl() ?? SELLER_INFO.siteUrl;

  return (
    <LegalPageLayout
      title="Реквизиты"
      description="Сведения о продавце цифровых материалов и контакт для обращений."
    >
      <LegalSection title="Продавец">
        <p>Продавец: {SELLER_INFO.sellerName}</p>
        <p>Статус: {SELLER_INFO.sellerStatus}</p>
        <p>ИНН: {SELLER_INFO.sellerInn}</p>
        <p>
          Адрес для корреспонденции: <LegalCorrespondenceAddress />
        </p>
      </LegalSection>

      <LegalSection title="Контакты">
        <p>
          Email поддержки:{" "}
          <a
            href={`mailto:${SELLER_INFO.sellerEmail}`}
            className="text-neutral-800 underline-offset-2 hover:underline"
          >
            {SELLER_INFO.sellerEmail}
          </a>
        </p>
        <p>
          Сайт:{" "}
          <a
            href={siteUrl}
            className="text-neutral-800 underline-offset-2 hover:underline"
          >
            {siteUrl}
          </a>
        </p>
      </LegalSection>

      <LegalSection title="Налоговый режим">
        <p>{SELLER_INFO.taxMode}</p>
      </LegalSection>

      <LegalSection title="Вид деятельности">
        <p>
          Продажа цифровых материалов, гайдов, шаблонов и заданий для дизайнеров
          на платформе «Дизайн Тусовка».
        </p>
      </LegalSection>

      <LegalSection title="Формат товара">
        <p>
          Цифровые материалы, гайды, шаблоны и задания для дизайнеров. Доступ
          предоставляется онлайн в личном кабинете после оплаты или бесплатного
          получения.
        </p>
      </LegalSection>

      <LegalSection title="Чек">
        <p>
          {SELLER_INFO.receiptInfo}. Чек формируется продавцом как плательщиком
          НПД и направляется покупателю.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
