import {
  LegalAddress,
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
        <p>ИП: {SELLER_INFO.legalName}</p>
        <p>ИНН: {SELLER_INFO.inn}</p>
        <p>ОГРНИП: {SELLER_INFO.ogrnip}</p>
        <p>
          Адрес: <LegalAddress />
        </p>
      </LegalSection>

      <LegalSection title="Контакты">
        <p>
          Email поддержки:{" "}
          <a
            href={`mailto:${SELLER_INFO.supportEmail}`}
            className="text-neutral-800 underline-offset-2 hover:underline"
          >
            {SELLER_INFO.supportEmail}
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

      <LegalSection title="Вид деятельности">
        <p>
          Продажа цифровых материалов, гайдов, шаблонов и заданий для дизайнеров
          на платформе «Дизайн Тусовка».
        </p>
      </LegalSection>

      <LegalSection title="Формат товара">
        <p>
          Цифровой контент. Доступ предоставляется в личном кабинете пользователя
          после подтверждения оплаты на сервере.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
