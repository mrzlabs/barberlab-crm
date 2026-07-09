import { and, asc, desc, eq, inArray, or, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { citaHistorial, citas, clientes, empleados, inventario, servicios, usuarios } from "@/lib/db/schema";
import { isDemoMode } from "@/lib/demo";
import { getCurrentProfile } from "@/lib/auth/session";
import { serializeDates } from "@/lib/utils";

export type Slot = {
  inicio: string;
  fin: string;
};

export async function getClienteByUsr(userId: string) {
  if (isDemoMode()) {
    return {
      id: "cliente-demo-1",
      negocioId: "00000000-0000-0000-0000-000000000010",
      usuarioId: userId,
      nombre: "Laura Cliente",
      telefono: "3104567890",
      email: "cliente@barberlab.local",
      notas: "Cliente demo",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  const [cliente] = await getDb().select().from(clientes).where(eq(clientes.usuarioId, userId)).limit(1);
  return cliente ? serializeDates(cliente) : null;
}

export async function ensureCliente(
  user: { id: string; nombre: string; email: string; telefono: string | null },
  negocioId: string,
) {
  const existing = await getClienteByUsr(user.id);
  if (existing) return existing;

  // Use INSERT … ON CONFLICT DO NOTHING + re-select to prevent duplicate race condition
  await getDb()
    .insert(clientes)
    .values({
      negocioId,
      usuarioId: user.id,
      nombre: user.nombre,
      email: user.email,
      telefono: user.telefono || "0000000000",
    })
    .onConflictDoNothing();

  const [record] = await getDb()
    .select()
    .from(clientes)
    .where(eq(clientes.usuarioId, user.id))
    .limit(1);

  if (!record) throw new Error("No se pudo crear el perfil de cliente");
  return serializeDates(record);
}

export async function getReservaCatalog() {
  if (isDemoMode()) {
    return {
      servicios: [
        { id: "11111111-1111-1111-1111-111111111111", categoria: "barberia", nombre: "Corte + barba", duracionMin: 45, precio: "65000" },
        { id: "22222222-2222-2222-2222-222222222222", categoria: "peluqueria", nombre: "Color + brushing", duracionMin: 120, precio: "180000" },
        { id: "33333333-3333-3333-3333-333333333333", categoria: "spa_unas", nombre: "Manicure semipermanente", duracionMin: 70, precio: "90000" },
      ],
      empleados: [
        { id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", especialidad: "barberia", nombre: "Mateo Barber" },
        { id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", especialidad: "peluqueria", nombre: "Sofia Stylist" },
        { id: "cccccccc-cccc-cccc-cccc-cccccccccccc", especialidad: "spa_unas", nombre: "Valen Nails" },
      ],
    };
  }

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
      { id: "prod-1", nombre: "Pomada premium", categoria: "Styling", stock: "12", unidad: "unidad", precioVenta: "32000", descripcion: "Fijación media con acabado natural.", fotoUrl: null },
      { id: "prod-2", nombre: "Aceite barba", categoria: "Cuidado", stock: "8", unidad: "unidad", precioVenta: "38000", descripcion: "Hidratación y brillo para barba.", fotoUrl: null },
      { id: "prod-3", nombre: "Kit uñas", categoria: "Spa", stock: "6", unidad: "unidad", precioVenta: "45000", descripcion: "Cuidado básico para mantenimiento.", fotoUrl: null },
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
      descripcion: inventario.descripcion,
      fotoUrl: inventario.fotoUrl,
    })
    .from(inventario)
    .where(and(eq(inventario.negocioId, profile?.negocioId || "00000000-0000-0000-0000-000000000000"), eq(inventario.activo, true), eq(inventario.visibleCliente, true), sql`${inventario.stock} > 0`))
    .orderBy(asc(inventario.categoria), asc(inventario.nombre))
    .limit(24);
}

export async function getSlots(empleadoId?: string, fecha?: string, servicioId?: string) {
  if (!empleadoId || !fecha || !servicioId) return [];
  if (isDemoMode()) {
    const base = new Date(`${fecha}T09:00:00-05:00`);
    return [0, 1, 2, 4, 6].map((offset) => {
      const inicio = new Date(base.getTime() + offset * 60 * 60000);
      const fin = new Date(inicio.getTime() + 45 * 60000);
      return { inicio: inicio.toISOString(), fin: fin.toISOString() };
    });
  }

  const rows = await getDb().execute(sql`
    select inicio, fin
    from public.disponibilidad_empleado(${empleadoId}::uuid, ${fecha}::date, ${servicioId}::uuid)
  `) as Array<{ inicio: string | Date; fin: string | Date }>;

  return rows.map((slot) => ({
    inicio: slot.inicio instanceof Date ? slot.inicio.toISOString() : String(slot.inicio),
    fin: slot.fin instanceof Date ? slot.fin.toISOString() : String(slot.fin),
  }));
}

export async function slotDisponible(params: { empleadoId: string; fecha: string; servicioId: string; inicio: Date; fin: Date }) {
  const slots = await getSlots(params.empleadoId, params.fecha, params.servicioId);
  const inicioIso = params.inicio instanceof Date ? params.inicio.toISOString() : String(params.inicio);
  const finIso = params.fin instanceof Date ? params.fin.toISOString() : String(params.fin);
  return slots.some((slot) => slot.inicio === inicioIso && slot.fin === finIso);
}

export async function getMisCitas(userId: string) {
  if (isDemoMode()) {
    const now = new Date();
    return {
      cliente: await getClienteByUsr(userId),
      citas: [
        {
          id: "cita-demo-cliente-1",
          inicio: new Date(now.getTime() + 24 * 60 * 60000),
          fin: new Date(now.getTime() + 24 * 60 * 60000 + 45 * 60000),
          estado: "confirmada",
          servicioId: "11111111-1111-1111-1111-111111111111",
          empleadoId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          servicio: "Corte + barba",
          precio: "65000",
          duracionMin: 45,
          empleado: "Mateo Barber",
        },
        {
          id: "cita-demo-cliente-2",
          inicio: new Date(now.getTime() - 72 * 60 * 60000),
          fin: new Date(now.getTime() - 72 * 60 * 60000 + 70 * 60000),
          estado: "realizada",
          servicioId: "33333333-3333-3333-3333-333333333333",
          empleadoId: "cccccccc-cccc-cccc-cccc-cccccccccccc",
          servicio: "Manicure semipermanente",
          precio: "90000",
          duracionMin: 70,
          empleado: "Valen Nails",
        },
      ],
    };
  }

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

  return serializeDates({ cliente, citas: rows });
}

export async function getHistorialCliente(userId: string) {
  if (isDemoMode()) {
    const now = new Date();
    return [
      {
        id: "hist-demo-1",
        citaId: "cita-demo-cliente-1",
        accion: "confirmacion",
        detalle: "Smart Style confirmó la cita.",
        estadoAnterior: "reservada",
        estadoNuevo: "confirmada",
        createdAt: new Date(now.getTime() - 2 * 60 * 60000),
        servicio: "Corte + barba",
      },
      {
        id: "hist-demo-2",
        citaId: "cita-demo-cliente-2",
        accion: "cierre",
        detalle: "Servicio atendido y cerrado.",
        estadoAnterior: "confirmada",
        estadoNuevo: "realizada",
        createdAt: new Date(now.getTime() - 70 * 60 * 60000),
        servicio: "Manicure semipermanente",
      },
    ];
  }

  const cliente = await getClienteByUsr(userId);
  if (!cliente) return [];

  const rows = await getDb()
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
    .where(and(
      eq(citas.clienteId, cliente.id),
      or(
        inArray(citaHistorial.estadoNuevo, ["reservada", "confirmada", "realizada", "cancelada"]),
        eq(citaHistorial.accion, "comentario_cliente")
      )
    ))
    .orderBy(desc(citaHistorial.createdAt))
    .limit(30);
  return serializeDates(rows);
}

export async function getComentariosParaCitas(citaIds: string[]) {
  if (isDemoMode() || citaIds.length === 0) return [] as { citaId: string; detalle: string | null; createdAt: string }[];
  const rows = await getDb()
    .select({ citaId: citaHistorial.citaId, detalle: citaHistorial.detalle, createdAt: citaHistorial.createdAt })
    .from(citaHistorial)
    .where(and(eq(citaHistorial.accion, "comentario_cliente"), inArray(citaHistorial.citaId, citaIds)))
    .orderBy(desc(citaHistorial.createdAt));
  return serializeDates(rows) as { citaId: string; detalle: string | null; createdAt: string }[];
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

/* ── Sistema de puntos: saldo del cliente y política del negocio ── */
export async function getMisPuntos(usuarioId: string) {
  if (isDemoMode()) {
    return { puntos: 120, habilitado: true, valorPunto: 30, minCanje: 100, pesosPorPunto: 1000 };
  }
  const { negocios } = await import("@/lib/db/schema");
  const { getPuntosConfig } = await import("@/lib/puntos");
  const [row] = await getDb()
    .select({ puntos: clientes.puntos, settings: negocios.settings })
    .from(clientes)
    .leftJoin(negocios, eq(clientes.negocioId, negocios.id))
    .where(eq(clientes.usuarioId, usuarioId))
    .limit(1);
  const config = getPuntosConfig(row?.settings ?? null);
  return {
    puntos: row?.puntos ?? 0,
    habilitado: config.habilitado,
    valorPunto: config.valorPunto,
    minCanje: config.minCanje,
    pesosPorPunto: config.pesosPorPunto,
  };
}
