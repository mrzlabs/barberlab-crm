import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { fmtDateTime, fmtMoney, fmtTime, franjaDia, toDateInput } from "@/lib/admin/format";
import { getProductosCliente, getReservaCatalog, getSlots, getWhatsAppNegocio } from "@/lib/cliente/queries";
import { buscarSlotsSchema } from "@/lib/validations/cliente";
import { reservarCita } from "./actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select, Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Record<string, string | string[] | undefined> };
function getParam(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }

export default async function ReservarPage({ searchParams }: PageProps) {
  const [catalog, products, whatsapp] = await Promise.all([getReservaCatalog(), getProductosCliente(), getWhatsAppNegocio()]);
  const whatsappHref = whatsapp.enabled
    ? `https://wa.me/${whatsapp.phone}?text=${encodeURIComponent(`Hola ${whatsapp.nombre}, quiero hacer una consulta.`)}`
    : null;
  const params = buscarSlotsSchema.parse({
    servicioId: getParam(searchParams?.servicioId) || catalog.servicios[0]?.id,
    empleadoId: getParam(searchParams?.empleadoId) || catalog.empleados[0]?.id,
    fecha: getParam(searchParams?.fecha) || toDateInput(),
    desde: getParam(searchParams?.desde) || "",
    hasta: getParam(searchParams?.hasta) || "",
  });
  const slots = await getSlots(params.empleadoId, params.fecha, params.servicioId, { desde: params.desde || undefined, hasta: params.hasta || undefined });
  const selectedService = catalog.servicios.find((service) => service.id === params.servicioId);
  const selectedEmployee = catalog.empleados.find((employee) => employee.id === params.empleadoId);

  // Agrupa los horarios por franja para que el cliente los escanee rápido.
  const franjas = ["Mañana", "Tarde", "Noche"] as const;
  const porFranja = franjas
    .map((nombre) => ({ nombre, items: slots.filter((s) => franjaDia(s.inicio) === nombre) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reservar cita"
        description="Consulta horarios libres por servicio y especialista, y separa tu cita."
      />

      <section className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <form className="h-fit rounded-card border border-ds-border bg-ds-surface p-5 shadow-ds-sm">
          <p className="text-[12px] font-medium uppercase tracking-wide text-ds-fg-muted">Disponibilidad</p>
          <h3 className="text-base font-semibold text-ds-fg">Buscar horario</h3>
          <div className="mt-4 grid gap-4">
            <label className="grid gap-1.5 text-[13px] font-medium text-ds-fg">Servicio
              <Select defaultValue={params.servicioId} name="servicioId" required>
                {catalog.servicios.map((service) => (
                  <option key={service.id} value={service.id}>{service.nombre} · {fmtMoney(service.precio)}</option>
                ))}
              </Select>
            </label>
            <label className="grid gap-1.5 text-[13px] font-medium text-ds-fg">Especialista
              <Select defaultValue={params.empleadoId} name="empleadoId" required>
                {catalog.empleados.map((employee) => (
                  <option key={employee.id} value={employee.id}>{employee.nombre} · {employee.especialidad.replace("_", " ")}</option>
                ))}
              </Select>
            </label>
            <label className="grid gap-1.5 text-[13px] font-medium text-ds-fg">Fecha
              <Input defaultValue={params.fecha} min={toDateInput()} name="fecha" required type="date" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1.5 text-[13px] font-medium text-ds-fg">Desde
                <Input defaultValue={params.desde} name="desde" type="time" />
              </label>
              <label className="grid gap-1.5 text-[13px] font-medium text-ds-fg">Hasta
                <Input defaultValue={params.hasta} name="hasta" type="time" />
              </label>
            </div>
            <button className="h-control rounded-control bg-ds-primary px-4 text-sm font-medium text-white transition-colors hover:bg-ds-primary-hover" type="submit">Consultar horarios</button>
          </div>
        </form>

        <section className="overflow-hidden rounded-card border border-ds-border bg-ds-surface shadow-ds-sm">
          <div className="flex items-center justify-between gap-3 border-b border-ds-border p-5">
            <div>
              <h3 className="text-base font-semibold text-ds-fg">Horarios disponibles</h3>
              <p className="mt-1 text-[13px] text-ds-fg-muted">{selectedService?.nombre || "Servicio"} con {selectedEmployee?.nombre || "especialista"}. Toca una hora para reservar.</p>
            </div>
            <Badge tone="neutral">{slots.length}</Badge>
          </div>
          <div className="space-y-5 p-5">
            {porFranja.map((grupo) => (
              <div key={grupo.nombre}>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ds-fg-muted">{grupo.nombre}</p>
                <div className="flex flex-wrap gap-2">
                  {grupo.items.map((slot) => (
                    <form action={reservarCita} key={slot.inicio}>
                      <input name="servicioId" type="hidden" value={params.servicioId} />
                      <input name="empleadoId" type="hidden" value={params.empleadoId} />
                      <input name="inicio" type="hidden" value={slot.inicio} />
                      <input name="fin" type="hidden" value={slot.fin} />
                      <button
                        type="submit"
                        title={`Reservar ${fmtDateTime(slot.inicio)}`}
                        className="ds-nums h-control rounded-control border border-ds-border bg-ds-surface px-3.5 text-sm font-semibold text-ds-fg transition-colors hover:border-ds-primary hover:bg-ds-primary hover:text-white"
                      >
                        {fmtTime(slot.inicio)}
                      </button>
                    </form>
                  ))}
                </div>
              </div>
            ))}
            {slots.length === 0 && (
              <p className="rounded-control border border-dashed border-ds-border p-8 text-center text-sm text-ds-fg-subtle">
                Sin horarios disponibles para la selección actual.
              </p>
            )}
          </div>
        </section>
      </section>

      <section className="rounded-card border border-ds-border bg-ds-surface p-5 shadow-ds-sm">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-wide text-ds-fg-muted">Productos disponibles</p>
            <h3 className="text-base font-semibold text-ds-fg">Compra en sede{whatsappHref ? " o por WhatsApp" : ""}</h3>
          </div>
          {whatsappHref && (
            <a className="inline-flex h-control items-center justify-center gap-2 rounded-control border border-ds-border-strong bg-ds-surface px-4 text-sm font-medium text-ds-fg transition-colors hover:bg-ds-surface-2" href={whatsappHref} target="_blank" rel="noreferrer">
              <MessageCircle className="size-4" /> Consultar por WhatsApp
            </a>
          )}
        </div>
        <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
          {products.map((item) => (
            <article className="min-w-[220px] rounded-control border border-ds-border bg-ds-surface p-4 shadow-ds-sm" key={item.id}>
              {item.fotoUrl ? (
                <span className="relative block size-16 overflow-hidden rounded-control">
                  <Image src={item.fotoUrl} alt={item.nombre} className="object-cover" fill sizes="64px" unoptimized />
                </span>
              ) : (
                <div className="grid size-16 place-items-center rounded-control bg-ds-surface-2 text-[10px] font-semibold text-ds-fg-subtle">IMG</div>
              )}
              <p className="mt-3"><Badge tone="neutral">{item.categoria}</Badge></p>
              <h4 className="mt-1.5 text-[15px] font-semibold text-ds-fg">{item.nombre}</h4>
              {item.descripcion && <p className="mt-1.5 line-clamp-3 text-[12px] leading-5 text-ds-fg-muted">{item.descripcion}</p>}
              <p className="ds-nums mt-2 text-[13px] font-semibold text-ds-fg">{fmtMoney(item.precioVenta)} · stock {item.stock} {item.unidad}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
