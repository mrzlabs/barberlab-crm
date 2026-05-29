import { and, asc, desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { citas, clientes, empleados, servicios, usuarios } from "@/lib/db/schema";

export type Slot = {
  inicio: Date;
  fin: Date;
};

export async function getClienteByUsr(userId: string) {
  const [cliente] = await getDb().select().from(clientes).where(eq(clientes.usuarioId, userId)).limit(1);
  return cliente ?? null;
}

export async function ensureCliente(user: { id: string; nombre: string; email: string; telefono: string | null }) {
  const existing = await getClienteByUsr(user.id);
  if (existing) return existing;

  const [created] = await getDb()
    .insert(clientes)
    .values({
      usuarioId: user.id,
      nombre: user.nombre,
      email: user.email,
      telefono: user.telefono || "0000000000",
    })
    .returning();

  return created;
}

export async function getReservaCatalog() {
  const db = getDb();
  const [serviciosActivos, empleadosActivos] = await Promise.all([
    db
      .select({
        id: servicios.id,
        categoria: servicios.categoria,
        nombre: servicios.nombre,
        duracionMin: servicios.duracionMin,
        precio: servicios.precio,
      })
      .from(servicios)
      .where(eq(servicios.activo, true))
      .orderBy(asc(servicios.categoria), asc(servicios.nombre)),
    db
      .select({
        id: empleados.id,
        especialidad: empleados.especialidad,
        nombre: usuarios.nombre,
      })
      .from(empleados)
      .innerJoin(usuarios, eq(empleados.usuarioId, usuarios.id))
      .where(and(eq(empleados.activo, true), eq(usuarios.activo, true)))
      .orderBy(asc(usuarios.nombre)),
  ]);

  return { servicios: serviciosActivos, empleados: empleadosActivos };
}

export async function getSlots(empleadoId?: string, fecha?: string, servicioId?: string) {
  if (!empleadoId || !fecha || !servicioId) return [];

  const rows = await getDb().execute(sql`
    select inicio, fin
    from public.disponibilidad_empleado(${empleadoId}::uuid, ${fecha}::date, ${servicioId}::uuid)
  `) as Array<{ inicio: string | Date; fin: string | Date }>;

  return rows.map((slot) => ({
    inicio: new Date(slot.inicio),
    fin: new Date(slot.fin),
  }));
}

export async function slotDisponible(params: { empleadoId: string; fecha: string; servicioId: string; inicio: Date; fin: Date }) {
  const slots = await getSlots(params.empleadoId, params.fecha, params.servicioId);
  return slots.some((slot) => slot.inicio.getTime() === params.inicio.getTime() && slot.fin.getTime() === params.fin.getTime());
}

export async function getMisCitas(userId: string) {
  const cliente = await getClienteByUsr(userId);
  if (!cliente) return { cliente: null, citas: [] };

  const rows = await getDb()
    .select({
      id: citas.id,
      inicio: citas.inicio,
      fin: citas.fin,
      estado: citas.estado,
      servicioId: citas.servicioId,
      empleadoId: citas.empleadoId,
      servicio: servicios.nombre,
      precio: servicios.precio,
      duracionMin: servicios.duracionMin,
      empleado: usuarios.nombre,
    })
    .from(citas)
    .innerJoin(servicios, eq(citas.servicioId, servicios.id))
    .innerJoin(empleados, eq(citas.empleadoId, empleados.id))
    .innerJoin(usuarios, eq(empleados.usuarioId, usuarios.id))
    .where(eq(citas.clienteId, cliente.id))
    .orderBy(desc(citas.inicio))
    .limit(40);

  return { cliente, citas: rows };
}

export async function citaPerteneceCliente(userId: string, citaId: string) {
  const cliente = await getClienteByUsr(userId);
  if (!cliente) return null;

  const [cita] = await getDb()
    .select({
      id: citas.id,
      clienteId: citas.clienteId,
      estado: citas.estado,
    })
    .from(citas)
    .where(and(eq(citas.id, citaId), eq(citas.clienteId, cliente.id)))
    .limit(1);

  return cita ?? null;
}
