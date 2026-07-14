import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alert = cva("rounded-control border px-3 py-2.5 text-[13px] font-medium", {
  variants: {
    tone: {
      danger: "border-ds-danger/30 bg-ds-danger-tint text-ds-danger",
      success: "border-ds-success/30 bg-ds-success-tint text-ds-success",
      warning: "border-ds-warning/30 bg-ds-warning-tint text-ds-warning",
      info: "border-ds-primary/25 bg-ds-primary-tint text-ds-primary",
    },
  },
  defaultVariants: { tone: "info" },
});

export function Alert({
  className,
  tone,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alert>) {
  return <div role="alert" className={cn(alert({ tone }), className)} {...props} />;
}
