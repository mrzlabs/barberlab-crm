import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-ds-border bg-ds-surface px-6 py-12 text-center",
        className,
      )}
    >
      {Icon && (
        <span className="grid size-10 place-items-center rounded-full bg-ds-surface-2 text-ds-fg-subtle">
          <Icon className="size-5" />
        </span>
      )}
      <div>
        <p className="text-sm font-semibold text-ds-fg">{title}</p>
        {description && <p className="mt-1 text-sm text-ds-fg-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
