import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const JUNIOR_STARTER_SECTION_HREF = "/sections/startoviy-nabor-juna";

export function HomeHeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-[#E8EEFF]">
      <div className="relative min-h-[280px] sm:min-h-[320px] lg:min-h-[360px]">
        <Image
          src="/hero-banner.jpg"
          alt=""
          fill
          sizes="(min-width: 1280px) 1280px, 100vw"
          className="object-cover object-right"
          priority
        />

        <div className="relative z-10 flex h-full min-h-[280px] items-center px-5 py-8 sm:min-h-[320px] sm:px-8 sm:py-10 lg:min-h-[360px] lg:px-10">
          <div className="max-w-md space-y-5 sm:max-w-lg lg:max-w-xl">
            <div className="space-y-3">
              <h1 className="text-[28px] leading-[34px] font-bold tracking-tight text-foreground sm:text-[32px] sm:leading-[38px] md:text-[40px] md:leading-[44px]">
                Бесплатный стартовый набор для джунов
              </h1>
              <p className="text-sm leading-6 text-neutral-600 sm:text-base">
                Три материала, которые помогут разобраться с откликами, уровнем junior и тем, как
                описывать опыт так, чтобы он выглядел убедительно
              </p>
            </div>

            <Link
              href={JUNIOR_STARTER_SECTION_HREF}
              className={cn(buttonVariants({ size: "lg" }), "text-sm font-normal")}
            >
              Забрать бесплатно
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
