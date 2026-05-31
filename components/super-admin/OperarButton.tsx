"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export function OperarButton({ negocioId, nombre }: { negocioId: string; nombre: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleOperar() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/impersonate/${negocioId}`);
      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error ?? "Error al generar acceso");
        return;
      }
      window.open(json.url, "_blank", "noopener,noreferrer");
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black text-white transition hover:opacity-90 disabled:opacity-50"
        disabled={loading}
        onClick={handleOperar}
        style={{ background: "linear-gradient(135deg,#22d3ee,#7c3aed)" }}
        title={`Operar ${nombre}`}
        type="button"
      >
        {loading ? <Loader2 className="size-3 animate-spin" /> : null}
        Operar
      </button>
      {error && <p className="text-[10px] font-bold text-rose-400">{error}</p>}
    </div>
  );
}
