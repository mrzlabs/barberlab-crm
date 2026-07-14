import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badge = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
  {
    variants: {
      tone: {
        neutral: "bg-ds-surface-2 text-ds-fg-muted",
        primary: "bg-ds-primary-tint text-ds-primary",
        success: "bg-ds-success-tint text-ds-success",
        warning: "bg-ds-warning-tint text-ds-warning",
        danger: "bg-ds-danger-tint text-ds-danger",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export function Badge({
  className,
  tone,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badge>) {
  return <span className={cn(badge({ tone }), className)} {...props} />;
}
