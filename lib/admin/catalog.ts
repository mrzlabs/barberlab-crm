import { asc, desc, eq } from "drizzle-orm";
import { isDemoMode } from "@/lib/demo";
import { getDb } from "@/lib/db";
import { bloqueosEmpleado, citas, clientes, empleados, horariosEmpleado, servicios, usuarios } from "@/lib/db/schema";

const now = new Date();

export async function getAgendaAdmin() {
  if (isDemoMode()) {
    return [
      { id: "cita-demo-1", inicio: now, fin: new Date(now.getTime() + 45 * 60000), estado: "confirmada", cliente: "Paula Gomez", telefono: "3104567890", servicio: "Corte y barba", empleado: "Mateo Barber", categoria: "barberia" },
      { id: "cita-demo-2", inicio: new Date(now.getTime() + 90 * 60000), fin: new Date(now.getTime() + 150 * 60000), estado: "reservada", cliente: "Daniel Ruiz", telefono: "3209876543", servicio: "Spa de unas", empleado: "Sofia Nails", categoria: "spa_unas" },
      { id: "cita-demo-3", inicio: new Date(now.getTime() + 180 * 60000), fin: new Date(now.getTime() + 300 * 60000), estado: "reservada", cliente: "Andres Mora", telefono: "3152223344", servicio: "Tatuaje pequeno", empleado: "Nico Ink", categoria: "tatuajes" },
    ];
  }

  return getDb()
    .select({
      id: citas.id,
      inicio: citas.inicio,
      fin: citas.fin,
      estado: citas.estado,
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

  return getDb().select().from(servicios).orderBy(asc(servicios.categoria), asc(servicios.nombre));
}

export async function getEmpleadosAdmin() {
  if (isDemoMode()) {
    return [
      { id: "emp-1", usuarioId: "usr-1", nombre: "Mateo Barber", email: "mateo@barberlab.local", telefono: "3101112233", especialidad: "barberia", comisionPct: "40", activo: true },
      { id: "emp-2", usuarioId: "usr-2", nombre: "Sofia Nails", email: "sofia@barberlab.local", telefono: "3105556677", especialidad: "spa_unas", comisionPct: "35", activo: true },
      { id: "emp-3", usuarioId: "usr-3", nombre: "Nico Ink", email: "nico@barberlab.local", telefono: "3118889900", especialidad: "tatuajes", comisionPct: "45", activo: true },
    ];
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
    .orderBy(asc(usuarios.nombre));
}

export async function getClientesAdmin() {
  if (isDemoMode()) {
    return [
      { id: "cli-1", usuarioId: null, nombre: "Carlos Rojas", telefono: "3001234567", email: "carlos@mail.com", notas: "Prefiere corte bajo", createdAt: now, updatedAt: now },
      { id: "cli-2", usuarioId: null, nombre: "Laura Vega", telefono: "3019876543", email: "laura@mail.com", notas: "Cliente frecuente de unas", createdAt: now, updatedAt: now },
      { id: "cli-3", usuarioId: null, nombre: "Andres Mora", telefono: "3025557788", email: "andres@mail.com", notas: "Interesado en tatuajes", createdAt: now, updatedAt: now },
    ];
  }

  return getDb().select().from(clientes).orderBy(desc(clientes.createdAt)).limit(100);
}

export async function getHorariosAdmin() {
  if (isDemoMode()) {
    return [
      { id: "hor-1", empleadoId: "emp-1", empleado: "Mateo Barber", diaSemana: 1, horaInicio: "09:00:00", horaFin: "18:00:00" },
      { id: "hor-2", empleadoId: "emp-1", empleado: "Mateo Barber", diaSemana: 2, horaInicio: "09:00:00", horaFin: "18:00:00" },
      { id: "hor-3", empleadoId: "emp-2", empleado: "Sofia Nails", diaSemana: 5, horaInicio: "10:00:00", horaFin: "19:00:00" },
    ];
  }

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
    .orderBy(asc(usuarios.nombre), asc(horariosEmpleado.diaSemana), asc(horariosEmpleado.horaInicio));
}

export async function getBloqueosAdmin() {
  if (isDemoMode()) {
    return [
      { id: "bloq-1", empleadoId: "emp-2", empleado: "Sofia Nails", fechaInicio: new Date(now.getTime() + 24 * 60 * 60000), fechaFin: new Date(now.getTime() + 28 * 60 * 60000), motivo: "Capacitacion" },
    ];
  }

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
    .orderBy(desc(bloqueosEmpleado.fechaInicio))
    .limit(40);
}
