import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const colorTokens = [
  { name: "Primary", value: "#094BF5", className: "bg-primary" },
  { name: "Blue 50", value: "#F2F6FF", className: "bg-blue-50" },
  { name: "Blue 600", value: "#094BF5", className: "bg-blue-600" },
  { name: "Текст", value: "#171717", className: "bg-neutral-900" },
  { name: "Вторичный", value: "#737373", className: "bg-neutral-600" },
  { name: "Фон", value: "#FFFFFF", className: "bg-background ring-1 ring-border" },
  { name: "Вторичный фон", value: "#F7F7F7", className: "bg-neutral-100" },
  { name: "Граница", value: "#E7E7E7", className: "bg-neutral-300" },
];

export default function Home() {
  return (
    <Container className="py-10 md:py-12 lg:py-16">
      <div className="mx-auto flex max-w-[760px] flex-col gap-10 md:gap-12">
        <section className="space-y-4">
          <Badge variant="secondary">Этап 2 · Дизайн-система</Badge>
          <h1 className="text-[36px] leading-[44px] font-semibold tracking-tight text-foreground">
            Дизайн Тусовка
          </h1>
          <p className="text-base leading-6 text-neutral-600">
            Практические материалы и задания для product, UX/UI и digital-дизайнеров.
            На этой странице — техническая проверка базовых UI-компонентов.
          </p>
          <p className="rounded-xl border border-neutral-300 bg-card px-4 py-3 text-sm leading-5 text-foreground">
            Базовая дизайн-система настроена. Каталог будет реализован на следующем
            этапе интерфейсов.
          </p>
        </section>

        <section className="flex flex-wrap gap-3">
          <Button type="button">Primary кнопка</Button>
          <Button type="button" variant="secondary">
            Secondary кнопка
          </Button>
          <Button type="button" variant="ghost">
            Ghost
          </Button>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Пример карточки</CardTitle>
            <CardDescription>
              Карточки: радиус 12px, граница Neutral 300, без тени. Кнопки и поля — 8px.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge>Бейдж</Badge>
              <Badge variant="secondary">Мини-гайд</Badge>
              <Badge variant="outline">Junior</Badge>
            </div>
            <Input placeholder="Пример поля ввода" aria-label="Пример поля ввода" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
            </div>
          </CardContent>
        </Card>

        <section className="space-y-4">
          <h2 className="text-[22px] leading-[30px] font-semibold text-foreground">
            Дизайн-токены
          </h2>
          <Separator />
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {colorTokens.map((token) => (
              <li
                key={token.name}
                className="overflow-hidden rounded-lg border border-neutral-300 bg-card"
              >
                <div className={`h-12 w-full ${token.className}`} />
                <div className="space-y-0.5 p-2">
                  <p className="text-xs font-medium text-foreground">{token.name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground sm:text-xs">
                    {token.value}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Container>
  );
}
