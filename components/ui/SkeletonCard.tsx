export function SkeletonCard({ rows = 3, className = "" }: { rows?: number; className?: string }) {
  return (
    <div className={`animate-pulse rounded-2xl border bg-white p-5 shadow-sm ${className}`}>
      <div className="mb-4 h-3 w-1/3 rounded-full bg-slate-200" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`mb-2.5 h-2.5 rounded-full bg-slate-200 last:mb-0 ${i % 3 === 0 ? "w-full" : i % 3 === 1 ? "w-4/5" : "w-3/5"}`} />
      ))}
    </div>
  );
}

export function SkeletonKpi({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-2xl border bg-white p-5 shadow-sm ${className}`}>
      <div className="mb-3 h-2 w-1/4 rounded-full bg-slate-200" />
      <div className="mb-2 h-7 w-1/2 rounded-full bg-slate-200" />
      <div className="h-2 w-3/4 rounded-full bg-slate-100" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4, className = "" }: { rows?: number; cols?: number; className?: string }) {
  return (
    <div className={`animate-pulse overflow-hidden rounded-2xl border bg-white shadow-sm ${className}`}>
      <div className="h-14 border-b bg-slate-100" />
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 border-b px-5 py-3.5 last:border-0">
          {Array.from({ length: cols }).map((__, c) => (
            <div key={c} className={`h-2.5 rounded-full bg-slate-200 ${c === 0 ? "flex-1" : "w-16"}`} />
          ))}
        </div>
      ))}
    </div>
  );
}
