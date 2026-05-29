import { and, asc, desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { citaHistorial, citas, clientes, empleados, inventario, servicios, usuarios } from "@/lib/db/schema";
import { isDemoMode } from "@/lib/demo";
import { getCurrentProfile } from "@/lib/auth/session";

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

  const profile = await getCurrentProfile();

  const [created] = await getDb()
    .insert(clientes)
    .values({
      negocioId: profile?.negocioId,
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
  const profile = await getCurrentProfile();
  const negocioId = profile?.negocioId || "00000000-0000-0000-0000-000000000000";
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
      .where(and(eq(servicios.negocioId, negocioId), eq(servicios.activo, true)))
      .orderBy(asc(servicios.categoria), asc(servicios.nombre)),
    db
      .select({
        id: empleados.id,
        especialidad: empleados.especialidad,
        nombre: usuarios.nombre,
      })
      .from(empleados)
      .innerJoin(usuarios, eq(empleados.usuarioId, usuarios.id))
      .where(and(eq(empleados.negocioId, negocioId), eq(empleados.activo, true), eq(usuarios.activo, true)))
      .orderBy(asc(usuarios.nombre)),
  ]);

  return { servicios: serviciosActivos, empleados: empleadosActivos };
}

export async function getProductosCliente() {
  if (isDemoMode()) {
    return [
      { id: "prod-1", nombre: "Pomada premium", categoria: "Styling", stock: "12", unidad: "unidad", precioVenta: "32000" },
      { id: "prod-2", nombre: "Aceite barba", categoria: "Cuidado", stock: "8", unidad: "unidad", precioVenta: "38000" },
      { id: "prod-3", nombre: "Kit unas", categoria: "Spa", stock: "6", unidad: "unidad", precioVenta: "45000" },
    ];
  }

  const profile = await getCurrentProfile();

  return getDb()
    .select({
      id: inventario.id,
      nombre: inventario.nombre,
      categoria: inventario.categoria,
      stock: inventario.stock,
      unidad: inventario.unidad,
      precioVenta: inventario.precioVenta,
    })
    .from(inventario)
    .where(and(eq(inventario.negocioId, profile?.negocioId || "00000000-0000-0000-0000-000000000000"), eq(inventario.activo, true), eq(inventario.visibleCliente, true), sql`${inventario.stock} > 0`))
    .orderBy(asc(inventario.categoria), asc(inventario.nombre))
    .limit(24);
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

export async function getHistorialCliente(userId: string) {
  const cliente = await getClienteByUsr(userId);
  if (!cliente) return [];

  return getDb()
    .select({
      id: citaHistorial.id,
      citaId: citaHistorial.citaId,
      accion: citaHistorial.accion,
      detalle: citaHistorial.detalle,
      estadoAnterior: citaHistorial.estadoAnterior,
      estadoNuevo: citaHistorial.estadoNuevo,
      createdAt: citaHistorial.createdAt,
      servicio: servicios.nombre,
    })
    .from(citaHistorial)
    .innerJoin(citas, eq(citaHistorial.citaId, citas.id))
    .innerJoin(servicios, eq(citas.servicioId, servicios.id))
    .where(eq(citas.clienteId, cliente.id))
    .orderBy(desc(citaHistorial.createdAt))
    .limit(30);
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
