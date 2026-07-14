import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function DeltaBadge({ delta }: { delta?: number | null }) {
  if (delta == null) return null;
  const up = delta >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium",
        up ? "bg-ds-success-tint text-ds-success" : "bg-ds-danger-tint text-ds-danger",
      )}
    >
      {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
      {Math.abs(delta)}%
    </span>
  );
}

export function Stat({
  label,
  value,
  detail,
  delta,
  href,
  className,
}: {
  label: string;
  value: string | number;
  detail?: string;
  delta?: number | null;
  href?: string;
  className?: string;
}) {
  const body = (
    <>
      <p className="truncate text-[12px] font-medium uppercase tracking-wide text-ds-fg-muted">{label}</p>
      <div className="mt-1.5 flex flex-wrap items-baseline gap-2">
        <span className="ds-nums text-2xl font-semibold tracking-tight text-ds-fg [overflow-wrap:anywhere]">{value}</span>
        <DeltaBadge delta={delta} />
      </div>
      {detail && <p className="mt-1 truncate text-[12px] text-ds-fg-muted">{detail}</p>}
    </>
  );

  const base = "block min-w-0 rounded-card border border-ds-border bg-ds-surface p-4 shadow-ds-sm";
  if (href) {
    return (
      <Link href={href} className={cn(base, "transition-colors hover:border-ds-border-strong hover:bg-ds-surface-2", className)}>
        {body}
      </Link>
    );
  }
  return <div className={cn(base, className)}>{body}</div>;
}
