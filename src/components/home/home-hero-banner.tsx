import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HomeHeroBanner() {
  return (
    <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#F0F1FF] to-[#F0F2FF]">
      <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,46%)] lg:gap-4">
        <div className="space-y-5 px-5 py-6 sm:px-8 sm:py-8 lg:py-10">
          <div className="space-y-3">
            <h1 className="text-[28px] leading-[34px] font-bold tracking-tight text-foreground sm:text-[32px] sm:leading-[38px] md:text-[40px] md:leading-[44px]">
              Прокачайте дизайн через практику
            </h1>
            <p className="max-w-xl text-sm leading-6 text-neutral-600 sm:text-base">
              Гайды, чек-листы, разборы и задания, которые помогают расти в профессии,
              собирать сильные кейсы и увереннее выходить на работу
            </p>
          </div>

          <Link
            href="#materials"
            className={cn(buttonVariants({ size: "lg" }), "text-sm font-normal")}
          >
            Смотреть материалы
          </Link>
        </div>

        <div className="relative flex min-h-[220px] items-end justify-center px-4 pb-4 sm:min-h-[280px] lg:min-h-[320px] lg:px-6 lg:pb-6">
          <Image
            src="/hero-banner.png"
            alt="Иллюстрация: инструменты дизайна, типографика и визуализация данных"
            width={1200}
            height={900}
            sizes="(min-width: 1024px) 520px, 100vw"
            className="h-auto w-full max-w-[520px] object-contain object-bottom"
            priority
          />
        </div>
      </div>
    </section>
  );
}
