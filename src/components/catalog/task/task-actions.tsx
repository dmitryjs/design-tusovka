"use client";

import Link from "next/link";
import { Play, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TaskActionsProps = {
  hasFullAccess: boolean;
  briefAnchorId?: string;
  className?: string;
  compact?: boolean;
};

export function TaskActions({
  hasFullAccess,
  briefAnchorId = "task-brief",
  className,
  compact = false,
}: TaskActionsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row",
        compact && "sm:flex-col",
        className,
      )}
    >
      {hasFullAccess ? (
        <Button render={<Link href={`#${briefAnchorId}`} />} className="flex-1">
          <Play className="size-4 shrink-0" aria-hidden />
          Начать задание
        </Button>
      ) : (
        <Button disabled className="flex-1">
          <Play className="size-4 shrink-0" aria-hidden />
          Начать задание
        </Button>
      )}
      <Button variant="outline" disabled className="flex-1">
        <Upload className="size-4 shrink-0" aria-hidden />
        Отправить решение
      </Button>
    </div>
  );
}
