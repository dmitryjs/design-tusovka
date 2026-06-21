"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function FooterNewsletter() {
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Рассылка скоро будет доступна.");
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">Будьте в курсе</h3>
        <p className="text-sm leading-5 text-neutral-600">
          Подпишитесь на рассылку и получайте лучшие материалы и новости.
        </p>
      </div>

      <form className="flex gap-2" onSubmit={handleSubmit}>
        <Input
          type="email"
          name="email"
          placeholder="Ваш email"
          autoComplete="email"
          className="min-w-0 flex-1"
          aria-label="Email для рассылки"
        />
        <Button type="submit" size="icon" aria-label="Подписаться на рассылку">
          <ArrowRight className="size-4" aria-hidden />
        </Button>
      </form>

      {message ? (
        <p className="text-xs text-neutral-500" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
