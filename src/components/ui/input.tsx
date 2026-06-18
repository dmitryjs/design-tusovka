import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-lg border border-neutral-300 bg-white px-3 text-sm leading-5 text-foreground transition-colors duration-150 outline-none placeholder:text-neutral-500 hover:border-neutral-400 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-blue-100 disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-500 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive-bg",
        className
      )}
      {...props}
    />
  )
}

export { Input }
