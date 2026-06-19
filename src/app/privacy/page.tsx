import {
  LegalPageLayout,
  LegalSection,
} from "@/components/legal/legal-page-layout";
import { SELLER_INFO } from "@/lib/legal/seller-info";

export const dynamic = "force-dynamic";

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Политика конфиденциальности"
      description="Как «Дизайн Тусовка» собирает и использует персональные данные."
      draftNotice="Черновик. Перед запуском оплат текст нужно проверить с юристом."
    >
      <LegalSection title="1. Какие данные собираются">
        <ul className="list-disc space-y-2 pl-5">
          <li>Email и имя (при регистрации и в профиле).</li>
          <li>Данные заказов: состав, сумма, статус оплаты.</li>
          <li>Действия на сайте, необходимые для работы сервиса (сессия, корзина, доступы).</li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Зачем используются данные">
        <ul className="list-disc space-y-2 pl-5">
          <li>Регистрация и вход в личный кабинет.</li>
          <li>Оформление заказов и предоставление доступа к материалам.</li>
          <li>Поддержка пользователей и обработка обращений.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Где хранятся данные">
        <p>
          Данные хранятся в облачной инфраструктуре с ограниченным доступом. База
          данных и аутентификация — Supabase; хостинг приложения — Vercel.
        </p>
      </LegalSection>

      <LegalSection title="4. Внешние сервисы">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Supabase</strong> — учётные записи, профили, заказы, доступы.
          </li>
          <li>
            <strong>Vercel</strong> — размещение и доставка веб-приложения.
          </li>
          <li>
            <strong>ЮKassa</strong> — приём платежей. Данные банковских карт на сервер
            «Дизайн Тусовка» не передаются и не хранятся.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Права пользователя">
        <p>
          Пользователь может запросить уточнение, обновление или удаление своих данных,
          направив обращение в поддержку, если это не противоречит требованиям закона
          (например, хранение данных о платежах).
        </p>
      </LegalSection>

      <LegalSection title="6. Контакты">
        <p>
          По вопросам персональных данных:{" "}
          <a
            href={`mailto:${SELLER_INFO.supportEmail}`}
            className="underline-offset-2 hover:underline"
          >
            {SELLER_INFO.supportEmail}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
