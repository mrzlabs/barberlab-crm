import { eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { clientes, puntosMovimientos, type NegocioSettings } from "@/lib/db/schema";

/* ============================================================
   Sistema de puntos (fidelización) — modelo FloorUX/OperUX.
   Configurable por negocio en negocios.settings.puntos.
   Cada movimiento queda trazado en puntos_movimientos.
   ============================================================ */

export interface PuntosConfig {
  habilitado: boolean;
  /** Pesos de consumo que otorgan 1 punto (1000 = 1 punto por cada $1.000). */
  pesosPorPunto: number;
  /** Valor en pesos de 1 punto al canjear. */
  valorPunto: number;
  /** Mínimo de puntos acumulados para poder canjear. */
  minCanje: number;
  /** Puntos de bienvenida al registrarse desde la página pública. */
  bonoRegistro: number;
}

export function getPuntosConfig(settings: NegocioSettings | null | undefined): PuntosConfig {
  const p = settings?.puntos ?? {};
  return {
    habilitado: p.habilitado ?? false,
    pesosPorPunto: p.pesosPorPunto && p.pesosPorPunto > 0 ? p.pesosPorPunto : 1000,
    valorPunto: p.valorPunto && p.valorPunto > 0 ? p.valorPunto : 30,
    minCanje: p.minCanje && p.minCanje > 0 ? p.minCanje : 100,
    bonoRegistro: p.bonoRegistro && p.bonoRegistro > 0 ? p.bonoRegistro : 0,
  };
}

/** Puntos que otorga un consumo según la política del negocio. */
export function puntosPorConsumo(config: PuntosConfig, montoPesos: number): number {
  if (!config.habilitado || montoPesos <= 0) return 0;
  return Math.floor(montoPesos / config.pesosPorPunto);
}

/**
 * Acredita (delta > 0) o canjea (delta < 0) puntos a un cliente,
 * con trazabilidad. No permite dejar saldo negativo.
 */
export async function moverPuntos(params: {
  negocioId: string;
  clienteId: string;
  delta: number;
  motivo: string;
  citaId?: string | null;
}): Promise<{ ok: boolean; saldo?: number }> {
  if (params.delta === 0) return { ok: true };
  const db = getDb();

  const [cliente] = await db
    .select({ puntos: clientes.puntos })
    .from(clientes)
    .where(eq(clientes.id, params.clienteId))
    .limit(1);
  if (!cliente) return { ok: false };
  if (params.delta < 0 && cliente.puntos + params.delta < 0) return { ok: false, saldo: cliente.puntos };

  await db.insert(puntosMovimientos).values({
    negocioId: params.negocioId,
    clienteId: params.clienteId,
    delta: params.delta,
    motivo: params.motivo,
    citaId: params.citaId ?? null,
  });

  await db
    .update(clientes)
    .set({ puntos: sql`${clientes.puntos} + ${params.delta}`, updatedAt: new Date().toISOString() })
    .where(eq(clientes.id, params.clienteId));

  return { ok: true, saldo: cliente.puntos + params.delta };
}
