import { and, asc, desc, eq, gte, ilike, lte, or } from "drizzle-orm";
import { isDemoMode } from "@/lib/demo";
import { getDb } from "@/lib/db";
import { bloqueosEmpleado, citas, clientes, empleados, horariosEmpleado, servicios, turnos, usuarios } from "@/lib/db/schema";
import { getCurrentProfile } from "@/lib/auth/session";

const now = new Date();

export async function getAgendaAdmin() {
  if (isDemoMode()) {
    return [
      { id: "cita-demo-1", inicio: now, fin: new Date(now.getTime() + 45 * 60000), estado: "confirmada", empleadoId: "emp-1", servicioId: "serv-2", cliente: "Paula Gomez", telefono: "3104567890", servicio: "Corte y barba", empleado: "Mateo Barber", categoria: "barberia" },
      { id: "cita-demo-2", inicio: new Date(now.getTime() + 90 * 60000), fin: new Date(now.getTime() + 150 * 60000), estado: "reservada", empleadoId: "emp-2", servicioId: "serv-3", cliente: "Daniel Ruiz", telefono: "3209876543", servicio: "Spa de unas", empleado: "Sofia Nails", categoria: "spa_unas" },
      { id: "cita-demo-3", inicio: new Date(now.getTime() + 180 * 60000), fin: new Date(now.getTime() + 300 * 60000), estado: "reservada", empleadoId: "emp-3", servicioId: "serv-4", cliente: "Andres Mora", telefono: "3152223344", servicio: "Tatuaje pequeno", empleado: "Nico Ink", categoria: "tatuajes" },
    ];
  }

  const profile = await getCurrentProfile();

  return getDb()
    .select({
      id: citas.id,
      inicio: citas.inicio,
      fin: citas.fin,
      estado: citas.estado,
      empleadoId: citas.empleadoId,
      servicioId: citas.servicioId,
      cliente: clientes.nombre,
      telefono: clientes.telefono,
      servicio: servicios.nombre,
      empleado: usuarios.nombre,
      categoria: servicios.categoria,
    })
    .from(citas)
    .innerJoin(clientes, eq(citas.clienteId, clientes.id))
    .innerJoin(servicios, eq(citas.servicioId, servicios.id))
    .innerJoin(empleados, eq(citas.empleadoId, empleados.id))
    .innerJoin(usuarios, eq(empleados.usuarioId, usuarios.id))
    .where(eq(citas.negocioId, profile?.negocioId || "00000000-0000-0000-0000-000000000000"))
    .orderBy(desc(citas.inicio))
    .limit(80);
}

export async function getServiciosAdmin() {
  if (isDemoMode()) {
    return [
      { id: "serv-1", categoria: "barberia", nombre: "Corte premium", duracionMin: 45, precio: "45000", costoInsumo: "5000", activo: true, createdAt: now, updatedAt: now },
      { id: "serv-2", categoria: "barberia", nombre: "Corte y barba", duracionMin: 60, precio: "65000", costoInsumo: "7000", activo: true, createdAt: now, updatedAt: now },
      { id: "serv-3", categoria: "spa_unas", nombre: "Manicure semipermanente", duracionMin: 75, precio: "80000", costoInsumo: "18000", activo: true, createdAt: now, updatedAt: now },
      { id: "serv-4", categoria: "tatuajes", nombre: "Tatuaje pequeno", duracionMin: 120, precio: "120000", costoInsumo: "22000", activo: true, createdAt: now, updatedAt: now },
    ];
  }

  const profile = await getCurrentProfile();
  return getDb().select().from(servicios).where(eq(servicios.negocioId, profile?.negocioId || "00000000-0000-0000-0000-000000000000")).orderBy(asc(servicios.categoria), asc(servicios.nombre));
}

export async function getEmpleadosAdmin(search?: string) {
  if (isDemoMode()) {
    const all = [
      { id: "emp-1", usuarioId: "usr-1", nombre: "Mateo Barber", email: "mateo@barberlab.local", telefono: "3101112233", especialidad: "barberia", comisionPct: "40", activo: true },
      { id: "emp-2", usuarioId: "usr-2", nombre: "Sofia Nails", email: "sofia@barberlab.local", telefono: "3105556677", especialidad: "spa_unas", comisionPct: "35", activo: true },
      { id: "emp-3", usuarioId: "usr-3", nombre: "Nico Ink", email: "nico@barberlab.local", telefono: "3118889900", especialidad: "tatuajes", comisionPct: "45", activo: true },
    ];
    if (!search) return all;
    const q = search.toLowerCase();
    return all.filter((e) => e.nombre.toLowerCase().includes(q));
  }

  const profile = await getCurrentProfile();
  const negocioId = profile?.negocioId || "00000000-0000-0000-0000-000000000000";
  const conditions = [eq(empleados.negocioId, negocioId)];
  if (search?.trim()) {
    conditions.push(ilike(usuarios.nombre, `%${search.trim()}%`));
  }
  return getDb()
    .select({
      id: empleados.id,
      usuarioId: empleados.usuarioId,
      nombre: usuarios.nombre,
      email: usuarios.email,
      telefono: usuarios.telefono,
      especialidad: empleados.especialidad,
      comisionPct: empleados.comisionPct,
      activo: empleados.activo,
    })
    .from(empleados)
    .innerJoin(usuarios, eq(empleados.usuarioId, usuarios.id))
    .where(and(...conditions))
    .orderBy(asc(usuarios.nombre));
}

export async function getClientesAdmin(search?: string) {
  if (isDemoMode()) {
    const all = [
      { id: "cli-1", usuarioId: null, nombre: "Carlos Rojas", telefono: "3001234567", email: "carlos@mail.com", notas: "Prefiere corte bajo", createdAt: now, updatedAt: now },
      { id: "cli-2", usuarioId: null, nombre: "Laura Vega", telefono: "3019876543", email: "laura@mail.com", notas: "Cliente frecuente de unas", createdAt: now, updatedAt: now },
      { id: "cli-3", usuarioId: null, nombre: "Andres Mora", telefono: "3025557788", email: "andres@mail.com", notas: "Interesado en tatuajes", createdAt: now, updatedAt: now },
    ];
    if (!search) return all;
    const q = search.toLowerCase();
    return all.filter((c) => c.nombre.toLowerCase().includes(q) || c.telefono.includes(q));
  }

  const profile = await getCurrentProfile();
  const negocioId = profile?.negocioId || "00000000-0000-0000-0000-000000000000";
  const conditions = [eq(clientes.negocioId, negocioId)];
  if (search?.trim()) {
    const term = `%${search.trim()}%`;
    conditions.push(or(ilike(clientes.nombre, term), ilike(clientes.telefono, term))!);
  }
  return getDb().select().from(clientes).where(and(...conditions)).orderBy(desc(clientes.createdAt)).limit(100);
}

export async function getAgendaDia(fecha: string) {
  if (isDemoMode()) {
    const base = new Date(`${fecha}T09:00:00`);
    return [
      { id: "d1", inicio: base.toISOString(), fin: new Date(base.getTime() + 45 * 60000).toISOString(), estado: "confirmada", empleadoId: "emp-1", cliente: "Paula Gomez", servicio: "Corte y barba", empleado: "Mateo Barber" },
      { id: "d2", inicio: new Date(base.getTime() + 60 * 60000).toISOString(), fin: new Date(base.getTime() + 120 * 60000).toISOString(), estado: "reservada", empleadoId: "emp-1", cliente: "Carlos Ruiz", servicio: "Corte premium", empleado: "Mateo Barber" },
      { id: "d3", inicio: base.toISOString(), fin: new Date(base.getTime() + 75 * 60000).toISOString(), estado: "confirmada", empleadoId: "emp-2", cliente: "Laura Vega", servicio: "Manicure semipermanente", empleado: "Sofia Nails" },
      { id: "d4", inicio: new Date(base.getTime() + 90 * 60000).toISOString(), fin: new Date(base.getTime() + 210 * 60000).toISOString(), estado: "reservada", empleadoId: "emp-3", cliente: "Andres Mora", servicio: "Tatuaje pequeno", empleado: "Nico Ink" },
    ];
  }

  const profile = await getCurrentProfile();
  const negocioId = profile?.negocioId || "00000000-0000-0000-0000-000000000000";
  const db = getDb();
  const inicio = new Date(`${fecha}T00:00:00-05:00`).toISOString();
  const fin = new Date(`${fecha}T23:59:59-05:00`).toISOString();

  const rows = await db
    .select({
      id: citas.id,
      inicio: citas.inicio,
      fin: citas.fin,
      estado: citas.estado,
      empleadoId: citas.empleadoId,
      cliente: clientes.nombre,
      servicio: servicios.nombre,
      empleado: usuarios.nombre,
    })
    .from(citas)
    .innerJoin(clientes, eq(citas.clienteId, clientes.id))
    .innerJoin(servicios, eq(citas.servicioId, servicios.id))
    .innerJoin(empleados, eq(citas.empleadoId, empleados.id))
    .innerJoin(usuarios, eq(empleados.usuarioId, usuarios.id))
    .where(and(eq(citas.negocioId, negocioId), gte(citas.inicio, inicio), lte(citas.inicio, fin)))
    .orderBy(asc(citas.inicio));

  return rows.map((r) => ({ ...r, inicio: String(r.inicio), fin: String(r.fin) }));
}

export async function getClienteDetalle(clienteId: string, negocioId: string) {
  if (isDemoMode()) {
    const now = new Date();
    return {
      cliente: { id: clienteId, nombre: "Carlos Rojas", telefono: "3001234567", email: "carlos@mail.com", notas: "Prefiere corte bajo", usuarioId: null },
      citas: [
        { citaId: "c1", inicio: new Date(now.getTime() - 7 * 86400000), estado: "realizada", servicio: "Corte premium", empleado: "Mateo Barber", precioBase: "45000", precioFinal: "45000", propina: "5000", metodoPago: "efectivo" as const },
        { citaId: "c2", inicio: new Date(now.getTime() - 21 * 86400000), estado: "realizada", servicio: "Corte y barba", empleado: "Mateo Barber", precioBase: "65000", precioFinal: "65000", propina: "0", metodoPago: "transferencia" as const },
        { citaId: "c3", inicio: new Date(now.getTime() - 45 * 86400000), estado: "cancelada", servicio: "Corte premium", empleado: "Mateo Barber", precioBase: "45000", precioFinal: null, propina: null, metodoPago: null },
      ],
    };
  }

  const db = getDb();
  const [clienteData, citasData] = await Promise.all([
    db
      .select()
      .from(clientes)
      .where(and(eq(clientes.id, clienteId), eq(clientes.negocioId, negocioId)))
      .limit(1),
    db
      .select({
        citaId: citas.id,
        inicio: citas.inicio,
        estado: citas.estado,
        servicio: servicios.nombre,
        empleado: usuarios.nombre,
        precioBase: servicios.precio,
        precioFinal: turnos.precioFinal,
        propina: turnos.propina,
        metodoPago: turnos.metodoPago,
      })
      .from(citas)
      .innerJoin(servicios, eq(citas.servicioId, servicios.id))
      .innerJoin(empleados, eq(citas.empleadoId, empleados.id))
      .innerJoin(usuarios, eq(empleados.usuarioId, usuarios.id))
      .leftJoin(turnos, eq(turnos.citaId, citas.id))
      .where(and(eq(citas.clienteId, clienteId), eq(citas.negocioId, negocioId)))
      .orderBy(desc(citas.inicio))
      .limit(120),
  ]);

  return {
    cliente: clienteData[0] ?? null,
    citas: citasData,
  };
}

export async function getHorariosAdmin() {
  if (isDemoMode()) {
    return [
      { id: "hor-1", empleadoId: "emp-1", empleado: "Mateo Barber", diaSemana: 1, horaInicio: "09:00:00", horaFin: "18:00:00" },
      { id: "hor-2", empleadoId: "emp-1", empleado: "Mateo Barber", diaSemana: 2, horaInicio: "09:00:00", horaFin: "18:00:00" },
      { id: "hor-3", empleadoId: "emp-2", empleado: "Sofia Nails", diaSemana: 5, horaInicio: "10:00:00", horaFin: "19:00:00" },
    ];
  }

  const profile = await getCurrentProfile();

  return getDb()
    .select({
      id: horariosEmpleado.id,
      empleadoId: horariosEmpleado.empleadoId,
      empleado: usuarios.nombre,
      diaSemana: horariosEmpleado.diaSemana,
      horaInicio: horariosEmpleado.horaInicio,
      horaFin: horariosEmpleado.horaFin,
    })
    .from(horariosEmpleado)
    .innerJoin(empleados, eq(horariosEmpleado.empleadoId, empleados.id))
    .innerJoin(usuarios, eq(empleados.usuarioId, usuarios.id))
    .where(eq(horariosEmpleado.negocioId, profile?.negocioId || "00000000-0000-0000-0000-000000000000"))
    .orderBy(asc(usuarios.nombre), asc(horariosEmpleado.diaSemana), asc(horariosEmpleado.horaInicio));
}

export async function getBloqueosAdmin() {
  if (isDemoMode()) {
    return [
      { id: "bloq-1", empleadoId: "emp-2", empleado: "Sofia Nails", fechaInicio: new Date(now.getTime() + 24 * 60 * 60000), fechaFin: new Date(now.getTime() + 28 * 60 * 60000), motivo: "Capacitacion" },
    ];
  }

  const profile = await getCurrentProfile();

  return getDb()
    .select({
      id: bloqueosEmpleado.id,
      empleadoId: bloqueosEmpleado.empleadoId,
      empleado: usuarios.nombre,
      fechaInicio: bloqueosEmpleado.fechaInicio,
      fechaFin: bloqueosEmpleado.fechaFin,
      motivo: bloqueosEmpleado.motivo,
    })
    .from(bloqueosEmpleado)
    .innerJoin(empleados, eq(bloqueosEmpleado.empleadoId, empleados.id))
    .innerJoin(usuarios, eq(empleados.usuarioId, usuarios.id))
    .where(eq(bloqueosEmpleado.negocioId, profile?.negocioId || "00000000-0000-0000-0000-000000000000"))
    .orderBy(desc(bloqueosEmpleado.fechaInicio))
    .limit(40);
}
