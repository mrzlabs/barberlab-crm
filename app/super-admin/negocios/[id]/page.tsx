import Link from "next/link";
import { notFound } from "next/navigation";
import { createNegocioUser, toggleNegocio, updateNegocio } from "../actions";
import { getNegocioById, getNegocioMonthlySummary, getNegocioStats, getNegocioUsers } from "@/lib/super-admin/queries";
import { BrandPreview } from "./BrandPreview";
import { ResetPasswordButton } from "./ResetPasswordButton";
import { OperarButton } from "@/components/super-admin/OperarButton";
import { fmtMoney } from "@/lib/admin/format";

export const dynamic = "force-dynamic";

const input = "w-full rounded-control border border-ds-border bg-ds-surface px-3 py-2 text-sm text-ds-fg outline-none transition-colors focus:border-ds-primary focus:ring-2 focus:ring-ds-ring/60 placeholder:text-ds-fg-subtle";

export default async function NegocioDetallePage({ params }: { params: { id: string } }) {
  const negocio = await getNegocioById(params.id);
  if (!negocio) notFound();

  const [stats, usuarios, monthly] = await Promise.all([
    getNegocioStats(negocio.id),
    getNegocioUsers(negocio.id),
    getNegocioMonthlySummary(negocio.id),
  ]);
  const statItems = [
    ["Empleados", stats.empleados],
    ["Clientes", stats.clientes],
    ["Citas", stats.citas],
    ["Turnos", stats.turnos],
    ["Inventario", stats.inventario],
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-card bg-ds-surface p-6 shadow-ds-sm shadow-violet-950/20 sm:p-8">
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-ds-primary">Cliente SaaS</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{negocio.nombre}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-ds-fg-muted">
              Gestiona identidad visual, suscripcion y aislamiento. Los datos operativos se mantienen separados por negocio_id.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <OperarButton negocioId={negocio.id} nombre={negocio.nombre} />
            <Link className="rounded-2xl border border-ds-border bg-ds-surface-2 px-4 py-3 text-sm font-semibold text-ds-fg backdrop-blur hover:bg-white/15" href="/super-admin/negocios">
              Volver
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statItems.map(([label, value]) => (
          <article className="rounded-card border border-ds-border bg-ds-surface p-5 shadow-ds-sm" key={label}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ds-fg-subtle">{label}</p>
            <strong className="mt-2 block text-3xl font-semibold">{value}</strong>
          </article>
        ))}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-card border border-ds-border bg-ds-surface p-5 shadow-ds-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-600">Este mes</p>
          <strong className="mt-2 block text-3xl font-semibold">{monthly.turnos}</strong>
          <p className="mt-1 text-sm text-ds-fg-subtle">Turnos cerrados</p>
        </article>
        <article className="rounded-card border border-ds-border bg-ds-surface p-5 shadow-ds-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">Ingresos mes</p>
          <strong className="mt-2 block text-3xl font-semibold">{fmtMoney(monthly.ingresos)}</strong>
          <p className="mt-1 text-sm text-ds-fg-subtle">Precio final + propinas</p>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Crear usuarios", "Administra administradores, empleados y clientes para esta barberia sin mezclar datos."],
          ["Suspender tienda", "Cambia el estado a suspendido cuando exista mora, retiro temporal o revision comercial."],
          ["Personalizar marca", "Ajusta logo, colores y fuente para que el CRM parezca propio del comercio."],
          ["Escalar plan", "Starter, Pro o Enterprise segun volumen, soporte y nivel de aislamiento."],
        ].map(([title, body]) => (
          <article className="rounded-card border border-ds-border bg-ds-surface p-5 shadow-ds-sm" key={title}>
            <h3 className="mt-5 text-lg font-semibold" style={{ color: "#ffffff" }}>{title}</h3>
            <p className="mt-2 text-sm leading-6" style={{ color: "#94a3b8" }}>{body}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_390px]">
        <form action={updateNegocio} className="rounded-card border border-ds-border bg-ds-surface p-5 shadow-ds-sm" data-brand-form>
          <input name="id" type="hidden" value={negocio.id} />
          <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "#00cec9" }}>Personalizacion</p>
          <h3 className="mt-1 text-2xl font-semibold" style={{ color: "#ffffff" }}>Marca y suscripcion</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold">
              Nombre
              <input className={input} name="nombre" defaultValue={negocio.nombre} required />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Slug
              <input className={input} name="slug" defaultValue={negocio.slug} required />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Telefono
              <input className={input} name="telefono" defaultValue={negocio.telefono || ""} />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Correo
              <input className={input} name="correo" type="email" defaultValue={negocio.correo || ""} />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Direccion
              <input className={input} name="direccion" defaultValue={negocio.direccion || ""} />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Representante
              <input className={input} name="representante" defaultValue={negocio.representante || ""} />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Tipo documento
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
            <label className="grid gap-2 text-sm font-bold">
              Numero documento
              <input className={input} name="numeroDocumento" defaultValue={negocio.numeroDocumento || ""} />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Indicativo ciudad
              <input className={input} name="ciudadIndicativo" defaultValue={negocio.ciudadIndicativo || ""} />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Contacto principal
              <input className={input} name="contactoPrincipal" defaultValue={negocio.contactoPrincipal || ""} />
            </label>
            <label className="grid gap-2 text-sm font-bold md:col-span-2">
              Descripcion
              <textarea className={input} name="descripcion" defaultValue={negocio.descripcion || ""} rows={3} />
            </label>
            <label className="grid gap-2 text-sm font-bold md:col-span-2">
              Slogan dashboard
              <input className={input} name="slogan" defaultValue={negocio.slogan || ""} />
            </label>
            <label className="grid gap-2 text-sm font-bold md:col-span-2">
              Logo URL
              <input className={input} name="logoUrl" defaultValue={negocio.logoUrl || ""} />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Color principal
              <input className={input} name="colorPrimario" type="color" defaultValue={negocio.colorPrimario} />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Color secundario
              <input className={input} name="colorSecundario" type="color" defaultValue={negocio.colorSecundario} />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Color acento
              <input className={input} name="colorAcento" type="color" defaultValue={negocio.colorAcento} />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Fuente
              <input className={input} name="fuente" defaultValue={negocio.fuente} />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Plan
              <select className={input} name="plan" defaultValue={negocio.plan}>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Estado
              <select className={input} name="estado" defaultValue={negocio.estado}>
                <option value="activo">Activo</option>
                <option value="suspendido">Suspendido</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Fecha renovación
              <input className={input} name="fechaFin" type="date" defaultValue={negocio.fechaFin || ""} />
            </label>
            <label className="grid gap-2 text-sm font-bold md:col-span-2">
              Aislamiento
              <select className={input} name="modoAislamiento" defaultValue={negocio.modoAislamiento}>
                <option value="multi_tenant">Multi-tenant</option>
                <option value="dedicado">Dedicado</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Base de comisión
              <select className={input} name="comisionBase" defaultValue={negocio.comisionBase || "precio_final"}>
                <option value="precio_final">Precio final</option>
                <option value="precio_menos_descuento">Precio menos descuento</option>
                <option value="precio_menos_insumo">Precio menos insumo</option>
              </select>
            </label>
            <label className="flex items-center gap-3 rounded-xl border bg-white/70 px-4 py-3 text-sm font-bold">
              <input name="propinaEnComision" type="hidden" value="false" />
              <input className="size-4 accent-violet-700" name="propinaEnComision" type="checkbox" value="true" defaultChecked={negocio.propinaEnComision} />
              Propina comisionable
            </label>
          </div>
          <button className="mt-5 h-control rounded-control px-5 text-sm font-medium hover:brightness-95" style={{ background: "var(--ds-primary)", color: "#fff" }} type="submit">
            Guardar cambios
          </button>
        </form>

        <BrandPreview
          defaultNombre={negocio.nombre}
          defaultPlan={negocio.plan}
          defaultEstado={negocio.estado}
          defaultPrimario={negocio.colorPrimario}
          defaultSecundario={negocio.colorSecundario}
          defaultAcento={negocio.colorAcento}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[430px_1fr]">
        <section className="rounded-card border border-ds-border bg-ds-surface p-5 shadow-ds-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "#00cec9" }}>Control comercial</p>
          <h3 className="mt-1 text-2xl font-semibold" style={{ color: "#ffffff" }}>Encender o apagar tienda</h3>
          <p className="mt-2 text-sm leading-6" style={{ color: "#94a3b8" }}>
            Al suspender o cancelar, los usuarios relacionados quedan inactivos. Al activar, se rehabilitan para operar.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            {[
              ["activo", "Activar"],
              ["suspendido", "Suspender"],
              ["cancelado", "Cancelar"],
            ].map(([estado, label]) => (
              <form action={toggleNegocio} key={estado}>
                <input name="id" type="hidden" value={negocio.id} />
                <input name="estado" type="hidden" value={estado} />
                <button className="h-control w-full rounded-control px-4 text-sm font-medium hover:brightness-95" style={{ background: "var(--ds-primary)", color: "#fff" }} type="submit">
                  {label}
                </button>
              </form>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-card border border-ds-border bg-ds-surface shadow-ds-sm">
          <div className="border-b p-5" style={{ borderColor: "rgba(51,65,85,0.5)" }}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "#00cec9" }}>Roles y accesos</p>
            <h3 className="mt-1 text-2xl font-semibold" style={{ color: "#ffffff" }}>Usuarios registrados</h3>
          </div>
          <div className="overflow-x-auto scrollbar-soft">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide" style={{ color: "var(--ds-fg-muted)" }}>
                <tr>
                  <th className="px-5 py-3">Usuario</th>
                  <th className="px-5 py-3">Rol</th>
                  <th className="px-5 py-3">Telefono</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody style={{ background: "rgba(10,15,30,0.9)" }}>
                {usuarios.map((user) => (
                  <tr className="border-t" style={{ borderColor: "rgba(51,65,85,0.4)" }} key={user.id}>
                    <td className="px-5 py-4">
                      <strong className="block" style={{ color: "#ffffff" }}>{user.nombre}</strong>
                      <span className="text-xs" style={{ color: "#94a3b8" }}>{user.email}</span>
                    </td>
                    <td className="px-5 py-4 capitalize" style={{ color: "#e2e8f0" }}>{user.rol}</td>
                    <td className="px-5 py-4" style={{ color: "#e2e8f0" }}>{user.telefono || "Sin telefono"}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={user.activo
                        ? { background: "rgba(16,185,129,0.2)", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)" }
                        : { background: "rgba(239,68,68,0.2)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}>
                        {user.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <ResetPasswordButton
                        userId={user.id}
                        nombre={user.nombre}
                        negocioId={negocio.id}
                      />
                    </td>
                  </tr>
                ))}
                {usuarios.length === 0 ? (
                  <tr><td className="px-5 py-8 text-center" style={{ color: "#94a3b8" }} colSpan={5}>Sin usuarios en este negocio.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </section>

      <section className="grid gap-6 xl:grid-cols-[430px_1fr]">
        <form action={createNegocioUser} className="rounded-card border border-ds-border bg-ds-surface p-5 shadow-ds-sm">
          <input name="negocioId" type="hidden" value={negocio.id} />
          <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "#00cec9" }}>Usuarios del negocio</p>
          <h3 className="mt-1 text-2xl font-semibold" style={{ color: "#ffffff" }}>Crear acceso</h3>
          <p className="mt-2 text-sm leading-6" style={{ color: "#94a3b8" }}>
            Crea usuarios dentro de esta barberia. El rol define su vista, permisos y datos visibles.
          </p>
          <div className="mt-5 grid gap-3">
            <select className={input} name="rol" defaultValue="empleado">
              <option value="admin">Admin negocio</option>
              <option value="empleado">Empleado</option>
              <option value="cliente">Cliente</option>
            </select>
            <input className={input} name="nombre" placeholder="Nombre completo" required />
            <input className={input} name="telefono" placeholder="Telefono" required />
            <input className={input} name="email" placeholder="Email" required type="email" />
            <input className={input} name="password" placeholder="Password inicial" required type="password" />
            <div className="grid gap-3 sm:grid-cols-2">
              <select className={input} name="especialidad" defaultValue="barberia">
                <option value="barberia">Barberia</option>
                <option value="peluqueria">Peluqueria</option>
                <option value="spa_unas">Spa de unas</option>
                <option value="tatuajes">Tatuajes</option>
              </select>
              <input className={input} name="comisionPct" placeholder="Comision %" type="number" min="0" max="100" step="0.01" defaultValue="0" />
            </div>
            <button className="h-control rounded-control px-4 text-sm font-medium hover:brightness-95" style={{ background: "var(--ds-primary)", color: "#fff" }} type="submit">
              Crear usuario
            </button>
          </div>
        </form>

        <section className="rounded-card border border-ds-border bg-ds-surface p-5 shadow-ds-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "#00cec9" }}>Operación MRZLABS</p>
          <h3 className="mt-1 text-2xl font-semibold" style={{ color: "#ffffff" }}>Flujo comercial por barberia</h3>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {[
              ["Onboarding", "Crear negocio, cargar marca, crear admin y validar acceso."],
              ["Equipo", "Crear empleados con especialidad, comision y agenda propia."],
              ["Clientes", "Crear clientes manuales o con acceso para reservas."],
              ["Retiro", "Suspender o cancelar tienda sin borrar historial operativo."],
              ["Mercado LATAM", "Soportar monedas, planes y operaciones por pais desde el modelo SaaS."],
              ["Decision", "Cruzar agenda, caja, inventario, no asistencia y rentabilidad."],
            ].map(([title, body]) => (
              <article className="rounded-2xl border p-4" style={{ background: "var(--ds-surface-2)", borderColor: "var(--ds-border)" }} key={title}>
                <strong className="block" style={{ color: "#00cec9", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</strong>
                <p className="mt-1 text-sm leading-6" style={{ color: "#94a3b8" }}>{body}</p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
