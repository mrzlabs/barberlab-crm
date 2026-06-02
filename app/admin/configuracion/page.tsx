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
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { negocios } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

const input = "w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-500 transition";
const fontOptions = ["Inter", "Poppins", "Montserrat", "Raleway", "DM Sans", "Playfair Display", "Space Grotesk"];

export default async function ConfiguracionPage() {
  const profile = await requireRole(["admin", "super_admin"]);
  if (!profile.negocioId) notFound();
  const [negocio, configRow] = await Promise.all([
    getNegocioById(profile.negocioId),
    getDb().select({ configVisual: negocios.configVisual }).from(negocios).where(eq(negocios.id, profile.negocioId)).limit(1),
  ]);
  if (!negocio) notFound();
  const configVisual = configRow[0]?.configVisual ?? {};

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-violet-950/20 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(34,211,238,.32),transparent_18rem),radial-gradient(circle_at_86%_62%,rgba(168,85,247,.38),transparent_20rem)]" />
        <div className="relative">
          <div className="mac-dots" />
          <p className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Mi barberia</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{negocio.nombre}</h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
            Personaliza colores, foto de perfil, fondo, datos comerciales y slogan visible en el CRM.
          </p>
        </div>
      </section>

      <form action={updateMiNegocio} className="glass-panel rounded-[2rem] p-5">
        <input name="negocioId" type="hidden" value={negocio.id} />
        <input name="logoUrl" type="hidden" value={negocio.logoUrl || ""} />

        {/* Plan info */}
        <div className="mb-5 grid gap-3 rounded-[1.5rem] border border-white/10 bg-white/10 backdrop-blur-md p-4 sm:grid-cols-3">
          <article>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Plan</p>
            <strong className="mt-1 block capitalize">{negocio.plan}</strong>
          </article>
          <article>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Estado</p>
            <strong className="mt-1 block capitalize">{negocio.estado}</strong>
          </article>
          <article>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Renovación</p>
            <strong className="mt-1 block">{negocio.fechaFin || "Sin fecha"}</strong>
          </article>
        </div>

        {/* Datos generales */}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold">Nombre<input className={input} name="nombre" defaultValue={negocio.nombre} required /></label>
          <label className="grid gap-2 text-sm font-bold">Telefono<input className={input} name="telefono" defaultValue={negocio.telefono || ""} /></label>
          <label className="grid gap-2 text-sm font-bold">Correo<input className={input} name="correo" type="email" defaultValue={negocio.correo || ""} /></label>
          <label className="grid gap-2 text-sm font-bold">Direccion<input className={input} name="direccion" defaultValue={negocio.direccion || ""} /></label>
          <label className="grid gap-2 text-sm font-bold">Representante<input className={input} name="representante" defaultValue={negocio.representante || ""} /></label>
          <label className="grid gap-2 text-sm font-bold">Tipo documento
            <select className={input} name="tipoDocumento" defaultValue={negocio.tipoDocumento || "cc"}>
              <option value="cc">Cedula ciudadania</option>
              <option value="ce">Cedula extranjeria</option>
              <option value="nit">NIT</option>
              <option value="pasaporte">Pasaporte</option>
              <option value="pep">PEP</option>
              <option value="ppt">PPT</option>
              <option value="ti">Tarjeta identidad</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold">Numero documento<input className={input} name="numeroDocumento" defaultValue={negocio.numeroDocumento || ""} /></label>
          <label className="grid gap-2 text-sm font-bold">Indicativo ciudad<input className={input} name="ciudadIndicativo" defaultValue={negocio.ciudadIndicativo || ""} /></label>
          <label className="grid gap-2 text-sm font-bold">Contacto principal<input className={input} name="contactoPrincipal" defaultValue={negocio.contactoPrincipal || ""} /></label>
          <label className="grid gap-2 text-sm font-bold md:col-span-2">Descripcion<textarea className={input} name="descripcion" defaultValue={negocio.descripcion || ""} rows={4} /></label>
          <label className="grid gap-2 text-sm font-bold md:col-span-2">Slogan dashboard<input className={input} name="slogan" defaultValue={negocio.slogan || ""} /></label>
          <label className="grid gap-2 text-sm font-bold">Fuente
            <select className={input} name="fuente" defaultValue={configVisual.fontFamily || negocio.fuente || "Inter"}>
              {fontOptions.map((font) => <option key={font} value={font}>{font}</option>)}
            </select>
          </label>
        </div>

        {/* ── Paleta de colores ─────────────────────────────────── */}
        <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/10 backdrop-blur-md p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">Identidad visual</p>
          <p className="mt-1 text-sm text-slate-500">
            Estos colores se aplican al sidebar, header, KPIs y botones del CRM en tiempo real.
          </p>

          {/* preview strip */}
          <div className="mt-4 flex h-10 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex-1" style={{ backgroundColor: negocio.colorPrimario }} />
            <div className="flex-1" style={{ backgroundColor: negocio.colorSecundario }} />
            <div className="flex-1" style={{ backgroundColor: negocio.colorAcento }} />
          </div>

          <div className="mt-5 grid gap-6 md:grid-cols-1 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Color principal — Sidebar &amp; Fondo
              </p>
              <ColorPicker
                name="colorPrimario"
                defaultValue={negocio.colorPrimario}
                swatches={PRIMARY_SWATCHES}
                label=""
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Color secundario — KPI Cards &amp; Highlights
              </p>
              <ColorPicker
                name="colorSecundario"
                defaultValue={negocio.colorSecundario}
                swatches={SECONDARY_SWATCHES}
                label=""
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Color acento — Botones CTA &amp; Badges
              </p>
              <ColorPicker
                name="colorAcento"
                defaultValue={negocio.colorAcento}
                swatches={ACCENT_SWATCHES}
                label=""
              />
            </div>
          </div>
        </div>

        {/* ── Reglas contables ─────────────────────────────────── */}
        <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/10 backdrop-blur-md p-4">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-violet-700">Reglas contables</p>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold">
              Base de comisión
              <select className={input} name="comisionBase" defaultValue={negocio.comisionBase || "precio_final"}>
                <option value="precio_final">Precio final del turno</option>
                <option value="precio_menos_descuento">Precio menos descuento</option>
                <option value="precio_menos_insumo">Precio menos costo de insumo</option>
              </select>
            </label>
            <label className="flex items-center gap-3 rounded-xl border bg-slate-50 px-4 py-3 text-sm font-bold">
              <input name="propinaEnComision" type="hidden" value="false" />
              <input className="size-4 accent-violet-700" name="propinaEnComision" type="checkbox" value="true" defaultChecked={negocio.propinaEnComision} />
              Incluir propina en comisión
            </label>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            Esta regla alimenta reportes, utilidad neta, utilidad por empleado y utilidad por servicio.
          </p>
        </div>

        <button className="mt-5 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-violet-950" type="submit">
          Guardar configuracion
        </button>
      </form>

      {/* Personalización visual avanzada */}
      <ConfigVisualPanel
        darkMode={!!configVisual.darkMode}
        bgPhotoUrl={configVisual.bgPhotoUrl}
        fontFamily={configVisual.fontFamily || negocio.fuente}
      />
    </div>
  );
}
