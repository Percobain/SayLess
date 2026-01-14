import { cn } from "../lib/utils";

/**
 * BrutalCard - Neo-Brutalist card component
 * Features: solid border, offset shadow, rounded corners
 */
export function BrutalCard({
  children,
  className,
  noPadding = false,
  noShadow = false,
  size = "default",
  ...props
}) {
  return (
    <div
      className={cn(
        "bg-white border-2 border-veil-ink rounded-brutal transition-all duration-200 ease-brutal",
        !noShadow && "shadow-brutal",
        !noPadding && (size === "sm" ? "p-4" : "p-6"),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * BrutalCardHeader - Card header with title and optional action
 */
export function BrutalCardHeader({ children, className, action, ...props }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between pb-4 mb-4 border-b-2 border-veil-ink",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3">{children}</div>
      {action && <div>{action}</div>}
    </div>
  );
}

/**
 * BrutalCardTitle - Card title text
 */
export function BrutalCardTitle({ children, className, icon: Icon, ...props }) {
  return (
    <h3
      className={cn(
        "text-lg font-display font-bold text-veil-ink flex items-center gap-3",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="w-5 h-5 text-veil-accent" />}
      {children}
    </h3>
  );
}

export default BrutalCard;
