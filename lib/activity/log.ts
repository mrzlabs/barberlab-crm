import { getDb } from "@/lib/db";
import { activityLogs } from "@/lib/db/schema";

export async function logActivity(opts: {
  usuarioId?: string | null;
  negocioId?: string | null;
  accion: string;
  detalle?: Record<string, unknown>;
}) {
  try {
    await getDb().insert(activityLogs).values({
      usuarioId: opts.usuarioId ?? null,
      negocioId: opts.negocioId ?? null,
      accion: opts.accion,
      detalle: opts.detalle ?? null,
    });
  } catch {
    // Activity logging must never crash the main flow
  }
}
