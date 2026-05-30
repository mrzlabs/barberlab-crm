import Link from "next/link";
import { notFound } from "next/navigation";
import { createNegocioUser, toggleNegocio, updateNegocio } from "../actions";
import { getNegocioById, getNegocioStats, getNegocioUsers } from "@/lib/super-admin/queries";
import { BrandPreview } from "./BrandPreview";

export const dynamic = "force-dynamic";

const input = "w-full rounded-xl border bg-white/80 px-3 py-2 text-sm outline-none focus:border-cyan-500";

export default async function NegocioDetallePage({ params }: { params: { id: string } }) {
  const negocio = await getNegocioById(params.id);
  if (!negocio) notFound();

  const [stats, usuarios] = await Promise.all([
    getNegocioStats(negocio.id),
    getNegocioUsers(negocio.id),
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
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-violet-950/20 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(34,211,238,.32),transparent_18rem),radial-gradient(circle_at_86%_62%,rgba(168,85,247,.38),transparent_20rem)]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mac-dots" />
            <p className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Cliente SaaS</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{negocio.nombre}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
              Gestiona identidad visual, suscripcion y aislamiento. Los datos operativos se mantienen separados por negocio_id.
            </p>
          </div>
          <Link className="w-fit rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-black text-white backdrop-blur hover:bg-white/15" href="/super-admin/negocios">
            Volver
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statItems.map(([label, value]) => (
          <article className="glass-panel rounded-[1.4rem] p-5" key={label}>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{label}</p>
            <strong className="mt-2 block text-3xl font-black">{value}</strong>
          </article>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Crear usuarios", "Administra administradores, empleados y clientes para esta barberia sin mezclar datos."],
          ["Suspender tienda", "Cambia el estado a suspendido cuando exista mora, retiro temporal o revision comercial."],
          ["Personalizar marca", "Ajusta logo, colores y fuente para que el CRM parezca propio del comercio."],
          ["Escalar plan", "Starter, Pro o Enterprise segun volumen, soporte y nivel de aislamiento."],
        ].map(([title, body]) => (
          <article className="glass-panel rounded-[1.4rem] p-5" key={title}>
            <div className="mac-dots" />
            <h3 className="mt-5 text-lg font-black text-slate-950">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_390px]">
        <form action={updateNegocio} className="glass-panel rounded-[2rem] p-5" data-brand-form>
          <input name="id" type="hidden" value={negocio.id} />
          <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">Personalizacion</p>
          <h3 className="mt-1 text-2xl font-black">Marca y suscripcion</h3>
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
            <label className="grid gap-2 text-sm font-bold md:col-span-2">
              Aislamiento
              <select className={input} name="modoAislamiento" defaultValue={negocio.modoAislamiento}>
                <option value="multi_tenant">Multi-tenant</option>
                <option value="dedicado">Dedicado</option>
              </select>
            </label>
          </div>
          <button className="mt-5 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white" type="submit">
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
        <section className="glass-panel rounded-[2rem] p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-700">Control comercial</p>
          <h3 className="mt-1 text-2xl font-black">Encender o apagar tienda</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
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
                <button className="w-full rounded-2xl border bg-white px-4 py-3 text-sm font-black text-slate-800 hover:border-violet-300" type="submit">
                  {label}
                </button>
              </form>
            ))}
          </div>
        </section>

        <section className="glass-panel overflow-hidden rounded-[2rem]">
          <div className="border-b border-slate-200/70 p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Roles y accesos</p>
            <h3 className="mt-1 text-2xl font-black">Usuarios registrados</h3>
          </div>
          <div className="overflow-x-auto scrollbar-soft">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-950 text-xs uppercase tracking-wide text-cyan-100">
                <tr>
                  <th className="px-5 py-3">Usuario</th>
                  <th className="px-5 py-3">Rol</th>
                  <th className="px-5 py-3">Telefono</th>
                  <th className="px-5 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white/80">
                {usuarios.map((user) => (
                  <tr className="border-t" key={user.id}>
                    <td className="px-5 py-4">
                      <strong className="block">{user.nombre}</strong>
                      <span className="text-xs text-slate-500">{user.email}</span>
                    </td>
                    <td className="px-5 py-4 capitalize">{user.rol}</td>
                    <td className="px-5 py-4">{user.telefono || "Sin telefono"}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-black ${user.activo ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                        {user.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                  </tr>
                ))}
                {usuarios.length === 0 ? (
                  <tr><td className="px-5 py-8 text-center text-slate-500" colSpan={4}>Sin usuarios en este negocio.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </section>

      <section className="grid gap-6 xl:grid-cols-[430px_1fr]">
        <form action={createNegocioUser} className="glass-panel rounded-[2rem] p-5">
          <input name="negocioId" type="hidden" value={negocio.id} />
          <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">Usuarios del negocio</p>
          <h3 className="mt-1 text-2xl font-black">Crear acceso</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
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
            <button className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white" type="submit">
              Crear usuario
            </button>
          </div>
        </form>

        <section className="glass-panel rounded-[2rem] p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Operación MRZLABS</p>
          <h3 className="mt-1 text-2xl font-black">Flujo comercial por barberia</h3>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {[
              ["Onboarding", "Crear negocio, cargar marca, crear admin y validar acceso."],
              ["Equipo", "Crear empleados con especialidad, comision y agenda propia."],
              ["Clientes", "Crear clientes manuales o con acceso para reservas."],
              ["Retiro", "Suspender o cancelar tienda sin borrar historial operativo."],
              ["Mercado LATAM", "Soportar monedas, planes y operaciones por pais desde el modelo SaaS."],
              ["Decision", "Cruzar agenda, caja, inventario, no asistencia y rentabilidad."],
            ].map(([title, body]) => (
              <article className="rounded-2xl border bg-white/80 p-4" key={title}>
                <strong className="block text-sm">{title}</strong>
                <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
