import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { getNegocioById } from "@/lib/super-admin/queries";
import { updateMiNegocio } from "./actions";

export const dynamic = "force-dynamic";

const input = "w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none focus:border-cyan-500";

export default async function ConfiguracionPage() {
  const profile = await requireRole(["admin", "super_admin"]);
  if (!profile.negocioId) notFound();
  const negocio = await getNegocioById(profile.negocioId);
  if (!negocio) notFound();

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-violet-950/20 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(34,211,238,.32),transparent_18rem),radial-gradient(circle_at_86%_62%,rgba(168,85,247,.38),transparent_20rem)]" />
        <div className="relative">
          <div className="mac-dots" />
          <p className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Mi barberia</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{negocio.nombre}</h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
            Personaliza colores, logo, datos comerciales y slogan visible en el CRM.
          </p>
        </div>
      </section>

      <form action={updateMiNegocio} className="glass-panel rounded-[2rem] p-5">
        <input name="negocioId" type="hidden" value={negocio.id} />
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
          <label className="grid gap-2 text-sm font-bold">Logo URL<input className={input} name="logoUrl" defaultValue={negocio.logoUrl || ""} /></label>
          <label className="grid gap-2 text-sm font-bold md:col-span-2">Descripcion<textarea className={input} name="descripcion" defaultValue={negocio.descripcion || ""} rows={4} /></label>
          <label className="grid gap-2 text-sm font-bold md:col-span-2">Slogan dashboard<input className={input} name="slogan" defaultValue={negocio.slogan || ""} /></label>
          <label className="grid gap-2 text-sm font-bold">Color principal<input className={input} name="colorPrimario" type="color" defaultValue={negocio.colorPrimario} /></label>
          <label className="grid gap-2 text-sm font-bold">Color secundario<input className={input} name="colorSecundario" type="color" defaultValue={negocio.colorSecundario} /></label>
          <label className="grid gap-2 text-sm font-bold">Color acento<input className={input} name="colorAcento" type="color" defaultValue={negocio.colorAcento} /></label>
          <label className="grid gap-2 text-sm font-bold">Fuente<input className={input} name="fuente" defaultValue={negocio.fuente} /></label>
        </div>
        <button className="mt-5 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white" type="submit">Guardar configuracion</button>
      </form>
    </div>
  );
}
