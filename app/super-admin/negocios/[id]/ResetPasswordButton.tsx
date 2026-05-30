"use client";

import { useState } from "react";
import { resetUserPassword } from "../actions";

export function ResetPasswordButton({
  userId,
  nombre,
  negocioId,
}: {
  userId: string;
  nombre: string;
  negocioId: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAction(formData: FormData) {
    const password = String(formData.get("password") || "");
    if (password.length < 8) {
      setError("Mínimo 8 caracteres");
      return;
    }
    try {
      await resetUserPassword(formData);
      setOpen(false);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al resetear la clave");
    }
  }

  return (
    <>
      <button
        onClick={() => { setOpen(true); setError(null); }}
        className="rounded-xl border bg-white px-3 py-1.5 text-xs font-black text-slate-800 hover:border-rose-300"
        type="button"
      >
        Resetear clave
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-2xl">
            <div className="bg-slate-950 p-5 text-white">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-300">Super Admin</p>
              <h3 className="mt-1 text-xl font-black">Resetear clave</h3>
              <p className="mt-1 text-sm text-slate-300">{nombre}</p>
            </div>
            <form action={handleAction} className="grid gap-4 p-5">
              <input type="hidden" name="userId" value={userId} />
              <input type="hidden" name="negocioId" value={negocioId} />
              {error && (
                <p className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">{error}</p>
              )}
              <label className="grid gap-2 text-sm font-bold">
                Nueva contraseña
                <input
                  className="w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-500"
                  name="password"
                  type="password"
                  minLength={8}
                  required
                  autoFocus
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => { setOpen(false); setError(null); }}
                  className="rounded-2xl border px-4 py-3 text-sm font-black text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
