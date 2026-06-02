"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cambiarClaveAction } from "./actions";

function PasswordInput({ name, placeholder }: { name: string; placeholder: string }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
        name={name}
        type={showPassword ? "text" : "password"}
        minLength={8}
        required
        placeholder={placeholder}
      />
      <button
        aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:text-white"
        onClick={() => setShowPassword((value) => !value)}
        type="button"
      >
        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export default function CambiarClavePage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const error = searchParams?.error;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#050709] p-4">
      <div className="w-full max-w-md">
        <div className="rounded-[2rem] border border-white/15 bg-white/8 p-8 shadow-2xl shadow-violet-950/30 backdrop-blur-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 shadow-lg shadow-violet-500/30">
              <span className="text-lg font-black text-white">BL</span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">BarberLab CRM</p>
              <h1 className="text-lg font-black text-white">Cambio de clave obligatorio</h1>
            </div>
          </div>

          <p className="mb-6 text-sm leading-6 text-slate-400">
            Tu cuenta requiere una nueva contraseña antes de continuar. Elige una clave segura con al menos 8 caracteres.
          </p>

          {error && (
            <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-400">
              {decodeURIComponent(error)}
            </p>
          )}

          <form action={cambiarClaveAction} className="grid gap-4">
            <label className="grid gap-2 text-xs font-bold uppercase tracking-wide text-slate-300">
              Nueva contraseña
              <PasswordInput name="password" placeholder="Mínimo 8 caracteres" />
            </label>
            <label className="grid gap-2 text-xs font-bold uppercase tracking-wide text-slate-300">
              Confirmar contraseña
              <PasswordInput name="passwordConfirm" placeholder="Repite la contraseña" />
            </label>
            <button
              className="mt-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.02] hover:opacity-95"
              type="submit"
            >
              Guardar nueva contraseña
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
