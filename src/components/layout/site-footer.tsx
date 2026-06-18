import { Container } from "@/components/layout/container";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card">
      <Container className="flex h-14 items-center">
        <p className="text-sm text-muted-foreground">
          Дизайн Тусовка · {year}
        </p>
      </Container>
    </footer>
  );
}
