import Link from "next/link";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export type CheckoutStep = "cart" | "data" | "payment" | "done";

const STEPS: Array<{ id: CheckoutStep; label: string; href: string | null }> = [
  { id: "cart", label: "Корзина", href: "/cart" },
  { id: "data", label: "Данные", href: "/checkout" },
  { id: "payment", label: "Оплата", href: "/checkout/payment" },
  { id: "done", label: "Готово", href: null },
];

function getStepIndex(step: CheckoutStep): number {
  return STEPS.findIndex((item) => item.id === step);
}

type CheckoutStepperProps = {
  currentStep: CheckoutStep;
};

export function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  const currentIndex = getStepIndex(currentStep);

  return (
    <nav aria-label="Этапы оформления заказа">
      <ol className="flex items-center justify-center gap-2 sm:gap-4">
        {STEPS.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isClickable = isComplete && step.href;

          const circle = (
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                isComplete && "bg-primary text-primary-foreground",
                isCurrent && "bg-primary text-primary-foreground",
                !isComplete && !isCurrent && "border border-neutral-300 bg-white text-neutral-500",
              )}
            >
              {isComplete ? <Check className="size-4" aria-hidden /> : index + 1}
            </span>
          );

          return (
            <li key={step.id} className="flex items-center gap-2 sm:gap-4">
              <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:gap-2">
                {isClickable ? (
                  <Link href={step.href!} className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200">
                    {circle}
                  </Link>
                ) : (
                  circle
                )}
                <span
                  className={cn(
                    "text-xs font-medium sm:text-sm",
                    isCurrent || isComplete ? "text-foreground" : "text-neutral-500",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 ? (
                <span
                  className={cn(
                    "hidden h-px w-6 sm:block sm:w-10 md:w-16",
                    index < currentIndex ? "bg-primary" : "bg-neutral-300",
                  )}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
