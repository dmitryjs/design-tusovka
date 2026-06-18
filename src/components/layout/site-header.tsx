import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <Container className="flex h-14 items-center justify-between">
        <span className="text-base font-semibold tracking-tight text-foreground">
          Дизайн Тусовка
        </span>
        <Button type="button" disabled aria-label="Войти (скоро)">
          Войти
        </Button>
      </Container>
    </header>
  );
}
