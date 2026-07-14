import { cn } from "@/lib/utils";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-[13px] font-medium text-ds-fg", className)} {...props} />;
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  className,
  children,
}: {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      {label && (
        <Label htmlFor={htmlFor}>
          {label}
          {required && <span className="ml-0.5 text-ds-danger">*</span>}
        </Label>
      )}
      {children}
      {error ? (
        <p className="text-[12px] font-medium text-ds-danger">{error}</p>
      ) : hint ? (
        <p className="text-[12px] text-ds-fg-muted">{hint}</p>
      ) : null}
    </div>
  );
}
