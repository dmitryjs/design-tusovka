import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium leading-5 whitespace-nowrap transition-colors duration-150 outline-none select-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-0 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-blue-700 active:bg-blue-800 disabled:bg-neutral-200 disabled:text-neutral-500",
        outline:
          "border-border bg-background text-foreground hover:bg-neutral-100 active:bg-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-500",
        secondary:
          "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-100 active:bg-neutral-200 disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-500",
        ghost:
          "text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 disabled:text-neutral-500",
        destructive:
          "bg-destructive-bg text-destructive-foreground border border-destructive-border hover:bg-destructive-border/30 focus-visible:ring-destructive-border/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 gap-1.5 px-3 py-2",
        sm: "h-8 gap-1 px-3 text-sm",
        lg: "h-12 gap-2 px-5 text-base leading-6",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
