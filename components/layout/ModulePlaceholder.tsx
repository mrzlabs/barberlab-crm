export function ModulePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">Modulo base</p>
      <h2 className="mt-2 text-2xl font-bold">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
    </section>
  );
}
