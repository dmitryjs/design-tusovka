import { cn } from "@/lib/utils";

type CheckoutSectionCardProps = {
  step: number;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function CheckoutSectionCard({
  step,
  title,
  description,
  action,
  children,
  className,
}: CheckoutSectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-neutral-200 bg-white p-5 sm:p-6",
        className,
      )}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <span
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-primary"
            aria-hidden
          >
            {step}
          </span>
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            {description ? (
              <p className="text-sm text-neutral-600">{description}</p>
            ) : null}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
