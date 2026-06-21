import Link from "next/link";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ProfileSectionCardProps = {
  title: string;
  href?: string;
  linkLabel?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function ProfileSectionCard({
  title,
  href,
  linkLabel = "Смотреть все →",
  footer,
  children,
  className,
}: ProfileSectionCardProps) {
  return (
    <Card className={cn("border-neutral-200 shadow-none", className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {href ? (
          <Link
            href={href}
            className="text-sm font-medium text-primary hover:underline"
          >
            {linkLabel}
          </Link>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
      {footer ? <CardFooter>{footer}</CardFooter> : null}
    </Card>
  );
}
