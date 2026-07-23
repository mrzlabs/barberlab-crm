export function fmtMoney(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function fmtDate(value: Date | string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeZone: "America/Bogota",
  }).format(new Date(value));
}

export function fmtDateTime(value: Date | string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Bogota",
  }).format(new Date(value));
}

export function toDateInput(value = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
  }).format(value);
}

/** Hora legible en zona del negocio, ej. "9:00 a. m." */
export function fmtTime(value: Date | string) {
  return new Intl.DateTimeFormat("es-CO", {
    timeStyle: "short",
    timeZone: "America/Bogota",
  }).format(new Date(value));
}

/** Hora en 24h "HH:MM" (zona del negocio) — para comparar rangos y agrupar franjas. */
export function horaBogota(value: Date | string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Bogota",
  }).format(new Date(value));
}

/** Franja del día a partir de la hora del negocio. */
export function franjaDia(value: Date | string): "Mañana" | "Tarde" | "Noche" {
  const hhmm = horaBogota(value);
  if (hhmm < "12:00") return "Mañana";
  if (hhmm < "18:00") return "Tarde";
  return "Noche";
}
