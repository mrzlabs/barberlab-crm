export function ModulePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section
      className="rounded-2xl border p-6"
      style={{ background: "#1a1a2e", borderColor: "rgba(255,255,255,0.1)" }}
    >
      <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: "#22d3ee" }}>
        Modulo base
      </p>
      <h2 className="mt-2 text-2xl font-bold text-white">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">{description}</p>
    </section>
  );
}
