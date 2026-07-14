import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const button = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ds-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-ds-primary text-ds-on-primary hover:bg-ds-primary-hover",
        secondary: "border border-ds-border-strong bg-ds-surface text-ds-fg hover:bg-ds-surface-2",
        ghost: "text-ds-fg-muted hover:bg-ds-surface-2 hover:text-ds-fg",
        danger: "bg-ds-danger text-white hover:brightness-95",
      },
      size: {
        sm: "h-control-dense px-3 text-[13px]",
        md: "h-control px-4 text-sm",
        lg: "h-11 px-5 text-sm",
        icon: "h-control w-control p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(button({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  ),
);
Button.displayName = "Button";
