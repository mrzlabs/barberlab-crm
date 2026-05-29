const now = new Date();

export const mockTurnos = [
  {
    id: "turno-1",
    createdAt: now,
    precioFinal: "45000",
    propina: "5000",
    metodoPago: "transferencia" as const,
    cliente: "Carlos Rojas",
    servicio: "Corte premium",
    empleado: "Mateo Barber",
  },
  {
    id: "turno-2",
    createdAt: now,
    precioFinal: "80000",
    propina: "0",
    metodoPago: "tarjeta" as const,
    cliente: "Laura Vega",
    servicio: "Manicure semipermanente",
    empleado: "Sofia Nails",
  },
  {
    id: "turno-3",
    createdAt: now,
    precioFinal: "120000",
    propina: "10000",
    metodoPago: "efectivo" as const,
    cliente: "Andres Mora",
    servicio: "Tatuaje pequeno",
    empleado: "Nico Ink",
  },
];

export const mockCitas = [
  {
    id: "cita-1",
    inicio: now,
    estado: "confirmada" as const,
    cliente: "Paula Gomez",
    servicio: "Corte y barba",
    precio: "65000",
    empleado: "Mateo Barber",
  },
  {
    id: "cita-2",
    inicio: new Date(now.getTime() + 3600000),
    estado: "reservada" as const,
    cliente: "Daniel Ruiz",
    servicio: "Spa de unas",
    precio: "90000",
    empleado: "Sofia Nails",
  },
];

export const mockGastos = [
  {
    id: "gasto-1",
    categoria: "arriendo" as const,
    monto: "1800000",
    fecha: "2026-05-28",
    descripcion: "Arriendo local",
    comprobanteUrl: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "gasto-2",
    categoria: "insumos" as const,
    monto: "420000",
    fecha: "2026-05-27",
    descripcion: "Reposicion de cuchillas, gel y tintas",
    comprobanteUrl: null,
    createdAt: now,
    updatedAt: now,
  },
];

export const mockInventario = [
  {
    id: "inv-1",
    sku: "BAR-001",
    nombre: "Cuchilla premium",
    categoria: "barberia",
    unidad: "unidad",
    stock: "36",
    costoUnitario: "1800",
    stockMinimo: "20",
    activo: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "inv-2",
    sku: "NAI-010",
    nombre: "Gel semipermanente",
    categoria: "unas",
    unidad: "ml",
    stock: "8",
    costoUnitario: "9000",
    stockMinimo: "10",
    activo: true,
    createdAt: now,
    updatedAt: now,
  },
];
