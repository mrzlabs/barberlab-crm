import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const base =
  "w-full rounded-control border border-ds-border bg-ds-surface px-3 text-sm text-ds-fg placeholder:text-ds-fg-subtle outline-none transition-colors focus:border-ds-primary focus:ring-2 focus:ring-ds-ring/60 disabled:cursor-not-allowed disabled:bg-ds-surface-2 disabled:text-ds-fg-subtle aria-[invalid=true]:border-ds-danger aria-[invalid=true]:focus:ring-ds-danger/30";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(base, "h-control", className)} {...props} />
  ),
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(base, "min-h-[80px] py-2 leading-6", className)} {...props} />
  ),
);
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select ref={ref} className={cn(base, "h-control appearance-none pr-8", className)} {...props} />
  ),
);
Select.displayName = "Select";
