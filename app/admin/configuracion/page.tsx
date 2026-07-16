import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { getNegocioById } from "@/lib/super-admin/queries";
import { updateMiNegocio } from "./actions";
import {
  ColorPicker,
  PRIMARY_SWATCHES,
  SECONDARY_SWATCHES,
  ACCENT_SWATCHES,
} from "@/components/admin/ColorPicker";
import { ConfigVisualPanel } from "@/components/admin/ConfigVisualPanel";
import { ClientesFidelizacionPanel } from "@/components/admin/ClientesFidelizacionPanel";
import { WhatsAppTemplatesPanel } from "@/components/admin/WhatsAppTemplatesPanel";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { negocios, type ConfigVisual } from "@/lib/db/schema";
import { isDemoMode } from "@/lib/demo-server";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

const lbl = "grid gap-1.5 text-[13px] font-medium text-ds-fg";
const fontOptions = ["Inter", "Poppins", "Montserrat", "Raleway", "DM Sans", "Playfair Display", "Space Grotesk"];

export default async function ConfiguracionPage() {
  const profile = await requireRole(["admin", "super_admin"]);
  if (!profile.negocioId) notFound();
  const [negocio, configRow] = await Promise.all([
    getNegocioById(profile.negocioId),
    await isDemoMode()
      ? Promise.resolve([{ configVisual: {} as ConfigVisual }])
      : getDb().select({ configVisual: negocios.configVisual }).from(negocios).where(eq(negocios.id, profile.negocioId)).limit(1),
  ]);
  if (!negocio) notFound();
  const configVisual = configRow[0]?.configVisual ?? {};

  return (
    <div className="space-y-5">
      <PageHeader
        title={negocio.nombre}
        description="Personaliza datos comerciales, identidad visual y reglas contables del negocio."
      />

      <Card>
        <form action={updateMiNegocio}>
          <input name="negocioId" type="hidden" value={negocio.id} />
          <input name="logoUrl" type="hidden" value={negocio.logoUrl || ""} />

          <CardBody className="space-y-6">
            {/* Plan info */}
            <div className="grid gap-3 rounded-control border border-ds-border bg-ds-surface-2 p-4 sm:grid-cols-3">
              {[
                { label: "Plan", value: negocio.plan, cap: true },
                { label: "Estado", value: negocio.estado, cap: true },
                { label: "Renovación", value: negocio.fechaFin || "Sin fecha", cap: false },
              ].map((it) => (
                <div key={it.label}>
                  <p className="text-[12px] font-medium uppercase tracking-wide text-ds-fg-muted">{it.label}</p>
                  <strong className={`mt-0.5 block text-sm font-semibold text-ds-fg ${it.cap ? "capitalize" : ""}`}>{it.value}</strong>
                </div>
              ))}
            </div>

            {/* Datos generales */}
            <div className="grid gap-4 md:grid-cols-2">
              <label className={lbl}>Nombre<Input name="nombre" defaultValue={negocio.nombre} required /></label>
              <label className={lbl}>Teléfono<Input name="telefono" defaultValue={negocio.telefono || ""} /></label>
              <label className={lbl}>Correo<Input name="correo" type="email" defaultValue={negocio.correo || ""} /></label>
              <label className={lbl}>Dirección<Input name="direccion" defaultValue={negocio.direccion || ""} /></label>
              <label className={lbl}>Representante<Input name="representante" defaultValue={negocio.representante || ""} /></label>
              <label className={lbl}>Tipo documento
                <Select name="tipoDocumento" defaultValue={negocio.tipoDocumento || "cc"}>
                  <option value="cc">Cédula ciudadanía</option>
                  <option value="ce">Cédula extranjería</option>
                  <option value="nit">NIT</option>
                  <option value="pasaporte">Pasaporte</option>
                  <option value="pep">PEP</option>
                  <option value="ppt">PPT</option>
                  <option value="ti">Tarjeta identidad</option>
                </Select>
              </label>
              <label className={lbl}>Número documento<Input name="numeroDocumento" defaultValue={negocio.numeroDocumento || ""} /></label>
              <label className={lbl}>Indicativo ciudad<Input name="ciudadIndicativo" defaultValue={negocio.ciudadIndicativo || ""} /></label>
              <label className={lbl}>Contacto principal<Input name="contactoPrincipal" defaultValue={negocio.contactoPrincipal || ""} /></label>
              <label className={`${lbl} md:col-span-2`}>Descripción<Textarea name="descripcion" defaultValue={negocio.descripcion || ""} rows={4} /></label>
              <label className={`${lbl} md:col-span-2`}>Slogan dashboard<Input name="slogan" defaultValue={negocio.slogan || ""} /></label>
              <label className={lbl}>Fuente
                <Select name="fuente" defaultValue={configVisual.fontFamily || negocio.fuente || "Inter"}>
                  {fontOptions.map((font) => <option key={font} value={font}>{font}</option>)}
                </Select>
              </label>
            </div>

            {/* Paleta de colores */}
            <div className="rounded-control border border-ds-border bg-ds-surface-2 p-5">
              <p className="text-[12px] font-medium uppercase tracking-wide text-ds-fg-muted">Identidad visual del negocio</p>
              <p className="mt-1 text-[13px] text-ds-fg-muted">Estos colores identifican la marca del negocio (logo, avatar). El chrome del CRM usa la paleta neutra del sistema.</p>

              <div className="mt-4 flex h-9 overflow-hidden rounded-control border border-ds-border">
                <div className="flex-1" style={{ backgroundColor: negocio.colorPrimario }} />
                <div className="flex-1" style={{ backgroundColor: negocio.colorSecundario }} />
                <div className="flex-1" style={{ backgroundColor: negocio.colorAcento }} />
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                <div className="rounded-control border border-ds-border bg-ds-surface p-4">
                  <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-ds-fg-muted">Color principal</p>
                  <ColorPicker name="colorPrimario" defaultValue={negocio.colorPrimario} swatches={PRIMARY_SWATCHES} label="" />
                </div>
                <div className="rounded-control border border-ds-border bg-ds-surface p-4">
                  <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-ds-fg-muted">Color secundario</p>
                  <ColorPicker name="colorSecundario" defaultValue={negocio.colorSecundario} swatches={SECONDARY_SWATCHES} label="" />
                </div>
                <div className="rounded-control border border-ds-border bg-ds-surface p-4">
                  <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-ds-fg-muted">Color acento</p>
                  <ColorPicker name="colorAcento" defaultValue={negocio.colorAcento} swatches={ACCENT_SWATCHES} label="" />
                </div>
              </div>
            </div>

            {/* Reglas contables */}
            <div className="rounded-control border border-ds-border bg-ds-surface-2 p-4">
              <p className="text-[12px] font-medium uppercase tracking-wide text-ds-fg-muted">Reglas contables</p>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <label className={lbl}>Base de comisión
                  <Select name="comisionBase" defaultValue={negocio.comisionBase || "precio_final"}>
                    <option value="precio_final">Precio final del turno</option>
                    <option value="precio_menos_descuento">Precio menos descuento</option>
                    <option value="precio_menos_insumo">Precio menos costo de insumo</option>
                  </Select>
                </label>
                <label className="flex items-center gap-3 self-end rounded-control border border-ds-border bg-ds-surface px-4 py-2.5 text-[13px] font-medium text-ds-fg">
                  <input name="propinaEnComision" type="hidden" value="false" />
                  <input className="size-4 accent-ds-primary" name="propinaEnComision" type="checkbox" value="true" defaultChecked={negocio.propinaEnComision} />
                  Incluir propina en comisión
                </label>
              </div>
              <p className="mt-3 text-[12px] leading-5 text-ds-fg-muted">
                Esta regla alimenta reportes, utilidad neta, utilidad por empleado y utilidad por servicio.
              </p>
            </div>

            <Button type="submit" size="lg">Guardar configuración</Button>
          </CardBody>
        </form>
      </Card>

      {/* Sub-paneles */}
      <ConfigVisualPanel bgPhotoUrl={configVisual.bgPhotoUrl} fontFamily={configVisual.fontFamily || negocio.fuente} />

      <ClientesFidelizacionPanel slug={negocio.slug} settings={negocio.settings} appUrl={process.env.NEXT_PUBLIC_APP_URL || ""} />

      <WhatsAppTemplatesPanel
        negocioId={negocio.id}
        initialPhone={String((configVisual as Record<string, unknown>).whatsapp_phone ?? "")}
        initialEnabled={Boolean((configVisual as Record<string, unknown>).whatsapp_enabled ?? false)}
        initialTemplates={{
          confirmacion: String(((configVisual as Record<string, unknown>).whatsapp_templates as Record<string, string> | null)?.confirmacion ?? "Hola {nombre_cliente}, tu cita en {nombre_negocio} para {servicio} con {empleado} está confirmada para el {fecha} a las {hora}. ¡Te esperamos!"),
          recordatorio: String(((configVisual as Record<string, unknown>).whatsapp_templates as Record<string, string> | null)?.recordatorio ?? "Hola {nombre_cliente}, te recordamos tu cita en {nombre_negocio} en 1 hora ({hora}). Si necesitas cancelar escríbenos."),
          seguimiento: String(((configVisual as Record<string, unknown>).whatsapp_templates as Record<string, string> | null)?.seguimiento ?? "Gracias por visitarnos {nombre_cliente}. Esperamos verte pronto en {nombre_negocio}. Reserva tu próxima cita aquí: {link_reserva}"),
        }}
      />
    </div>
  );
}
