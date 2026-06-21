import type { CheckoutStep } from "@/components/checkout/checkout-stepper";
import { CheckoutStepper } from "@/components/checkout/checkout-stepper";
import { cn } from "@/lib/utils";

type CheckoutShellProps = {
  step: CheckoutStep;
  title: string;
  description: string;
  children: React.ReactNode;
  sidebar: React.ReactNode;
  className?: string;
};

export function CheckoutShell({
  step,
  title,
  description,
  children,
  sidebar,
  className,
}: CheckoutShellProps) {
  return (
    <div className={cn("space-y-8", className)}>
      <CheckoutStepper currentStep={step} />

      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[28px] sm:leading-9">
          {title}
        </h1>
        <p className="text-sm text-neutral-600 sm:text-base">{description}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">{children}</div>
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">{sidebar}</aside>
      </div>
    </div>
  );
}
