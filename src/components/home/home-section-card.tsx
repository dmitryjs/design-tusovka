import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";

import type { HomeSectionCardItem } from "@/lib/catalog/section-covers";
import { preventHangingPrepositions } from "@/lib/typography";
import { cn } from "@/lib/utils";

type HomeSectionCardProps = {
  section: HomeSectionCardItem;
  className?: string;
};

export function HomeSectionCard({ section, className }: HomeSectionCardProps) {
  return (
    <Link
      href={section.href}
      className={cn(
        "group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200",
        className,
      )}
    >
      <article className="relative aspect-video overflow-hidden rounded-lg bg-neutral-100">
        {section.coverPath ? (
          <Image
            src={section.coverPath}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-violet-50" />
        )}
        <h3 className="home-section-card-title absolute top-0 left-0 max-w-[calc(100%-48px)] p-6 text-white">
          {section.cardTitleLines.map((line, index) => (
            <Fragment key={index}>
              {index > 0 ? <br /> : null}
              {preventHangingPrepositions(line)}
            </Fragment>
          ))}
        </h3>
      </article>
    </Link>
  );
}
