import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D94A3A] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#F0ECD9] text-[#0A0A0A] hover:bg-[#F0ECD9]/90",
        destructive:
          "bg-[#D94A3A] text-[#F0ECD9] hover:bg-[#D94A3A]/90",
        outline:
          "border border-[#F0ECD9]/20 bg-transparent text-[#F0ECD9] hover:bg-[#F0ECD9]/5 hover:border-[#F0ECD9]/40",
        secondary:
          "bg-[#F0ECD9]/10 text-[#F0ECD9] hover:bg-[#F0ECD9]/20",
        ghost: "text-[#F0ECD9] hover:text-[#D94A3A] hover:bg-transparent",
        link: "text-[#F0ECD9] underline-offset-4 hover:underline hover:text-[#D94A3A]",
        // Neo-brutalist text + arrow style
        editorial: "bg-transparent text-[#F0ECD9] hover:text-[#D94A3A] p-0 h-auto group",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, showArrow = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    >
      {props.children}
      {(showArrow || variant === 'editorial') && (
        <ArrowRight className="ml-1 w-4 h-4 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1" />
      )}
    </Comp>
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
