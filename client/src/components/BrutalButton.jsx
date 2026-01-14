import { forwardRef } from "react";
import { cn } from "../lib/utils";
import { ArrowRight, Loader2 } from "lucide-react";

/**
 * BrutalButton - Neo-Brutalist button component
 * Features: solid border, offset shadow, hover lift, active press
 */
const BrutalButton = forwardRef(
  (
    {
      children,
      className,
      variant = "primary",
      size = "default",
      showArrow = false,
      loading = false,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      "inline-flex items-center justify-center gap-2 font-semibold",
      "border-2 border-veil-ink rounded-brutal",
      "transition-all duration-200 ease-brutal",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-veil-accent focus-visible:ring-offset-2",
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
    );

    const variants = {
      primary: cn(
        "bg-veil-ink text-white",
        "shadow-brutal-sm",
        "hover:bg-veil-accent hover:-translate-y-0.5 hover:shadow-brutal",
        "active:translate-y-0 active:shadow-brutal-sm"
      ),
      secondary: cn(
        "bg-white text-veil-ink",
        "shadow-brutal-sm",
        "hover:-translate-y-0.5 hover:shadow-brutal hover:bg-veil-muted",
        "active:translate-y-0 active:shadow-brutal-sm"
      ),
      accent: cn(
        "bg-veil-accent text-white border-veil-accent",
        "shadow-brutal-sm",
        "hover:-translate-y-0.5 hover:shadow-brutal hover:bg-veil-accent/90",
        "active:translate-y-0 active:shadow-brutal-sm"
      ),
      danger: cn(
        "bg-veil-danger text-white border-veil-danger",
        "shadow-brutal-sm",
        "hover:-translate-y-0.5 hover:shadow-brutal hover:bg-veil-danger/90",
        "active:translate-y-0 active:shadow-brutal-sm"
      ),
      success: cn(
        "bg-veil-success text-white border-veil-success",
        "shadow-brutal-sm",
        "hover:-translate-y-0.5 hover:shadow-brutal hover:bg-veil-success/90",
        "active:translate-y-0 active:shadow-brutal-sm"
      ),
      ghost: cn(
        "bg-transparent text-veil-ink border-transparent shadow-none",
        "hover:text-veil-accent hover:translate-x-0.5",
        "active:translate-x-0"
      ),
      outline: cn(
        "bg-transparent text-veil-ink",
        "shadow-brutal-sm",
        "hover:-translate-y-0.5 hover:shadow-brutal hover:bg-veil-muted/50",
        "active:translate-y-0 active:shadow-brutal-sm"
      ),
    };

    const sizes = {
      sm: "h-9 px-4 text-sm",
      default: "h-11 px-6 text-sm",
      lg: "h-14 px-8 text-base",
      icon: "h-11 w-11",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {children}
            {showArrow && (
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            )}
          </>
        )}
      </button>
    );
  }
);

BrutalButton.displayName = "BrutalButton";

export { BrutalButton };
export default BrutalButton;
