"use client";

import { useEffect, useRef, useState } from "react";
import { generateMaylo } from "@/lib/maylo";
import { Eye, EyeOff, X } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { loginAction } from "./actions";

function AtomCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    if (!ctx) return;
    let w = 0, h = 0, raf = 0;
    const cyan = [0, 206, 201];
    const violet = [108, 92, 231];
    const qty = 60;
    type Particle = { x: number; y: number; vx: number; vy: number; r: number; p: number; orbitR: number; orbitSpeed: number; orbitAngle: number; cx: number; cy: number };
    const parts: Particle[] = [];
    function lerp(a: number[], b: number[], t: number) { return a.map((v, i) => Math.round(v + (b[i] - v) * t)); }
    function resize() {
      if (!cv) return;
      w = cv.width = cv.offsetWidth;
      h = cv.height = cv.offsetHeight;
      parts.length = 0;
      for (let i = 0; i < qty; i += 1) {
        const orbitR = 20 + Math.random() * 60;
        parts.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.12, vy: (Math.random() - 0.5) * 0.12, r: 2 + Math.random() * 3, p: Math.random() * Math.PI * 2, orbitR, orbitSpeed: (Math.random() > 0.5 ? 1 : -1) * (0.002 + Math.random() * 0.004), orbitAngle: Math.random() * Math.PI * 2, cx: Math.random() * w, cy: Math.random() * h });
      }
    }
    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    resize();
    function tick() {
      ctx.clearRect(0, 0, w, h);
      parts.forEach((p) => {
        p.cx += p.vx;
        p.cy += p.vy;
        if (p.cx < 0 || p.cx > w) p.vx *= -1;
        if (p.cy < 0 || p.cy > h) p.vy *= -1;
        p.orbitAngle += p.orbitSpeed;
        p.p += 0.008;
        p.x = p.cx + Math.cos(p.orbitAngle) * p.orbitR;
        p.y = p.cy + Math.sin(p.orbitAngle) * p.orbitR;
      });
      const maxDist = 110;
      for (let i = 0; i < parts.length; i += 1) {
        for (let j = i + 1; j < parts.length; j += 1) {
          const dx = parts[i].x - parts[j].x;
          const dy = parts[i].y - parts[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 > maxDist * maxDist) continue;
          const [r, g, b] = lerp(cyan, violet, i / parts.length);
          const alpha = (1 - Math.sqrt(d2) / maxDist) * 0.18;
          ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(parts[i].x, parts[i].y);
          ctx.lineTo(parts[j].x, parts[j].y);
          ctx.stroke();
        }
      }
      parts.forEach((p, i) => {
        const [r, g, b] = lerp(cyan, violet, i / parts.length);
        const brightness = 0.55 + Math.sin(p.p) * 0.25;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${brightness})`;
        ctx.shadowColor = `rgba(${r},${g},${b},0.6)`;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}

function MayloBg() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.18]" aria-hidden="true">
      <svg viewBox="0 0 64 80" fill="none" width="280" height="350">
        <line x1="35" y1="3" x2="32" y2="10" stroke="#3d2f7a" strokeWidth="2.2" strokeLinecap="round"/>
        <circle cx="36.5" cy="2" r="3.5" fill="#4fc3f7" stroke="#2a1f5e" strokeWidth="1"/>
        <rect x="14" y="9" width="36" height="26" rx="7" fill="#4c3a91" stroke="#2a1f5e" strokeWidth="1.5"/>
        <circle cx="26" cy="22" r="6" fill="#f5c518"/><circle cx="42" cy="22" r="6" fill="#f5c518"/>
        <circle cx="26" cy="22" r="3.2" fill="#1a1230"/><circle cx="42" cy="22" r="3.2" fill="#1a1230"/>
        <rect x="26" y="35" width="12" height="6" rx="3" fill="#3d2f7a" stroke="#2a1f5e" strokeWidth="1.2"/>
        <rect x="10" y="41" width="44" height="28" rx="7" fill="#4c3a91" stroke="#2a1f5e" strokeWidth="1.5"/>
        <rect x="19" y="49" width="24" height="14" rx="3.5" fill="#3d2f7a" stroke="#2a1f5e" strokeWidth="1"/>
        <circle cx="26" cy="56" r="2.8" fill="#4fc3f7" opacity="0.9"/>
        <circle cx="32" cy="56" r="2" fill="#f5c518" opacity="0.75"/>
        <rect x="15" y="69" width="13" height="9" rx="4" fill="#3d2f7a" stroke="#2a1f5e" strokeWidth="1.2"/>
        <rect x="36" y="69" width="13" height="9" rx="4" fill="#3d2f7a" stroke="#2a1f5e" strokeWidth="1.2"/>
      </svg>
    </div>
  );
}

function MayloIdentity() {
  return (
    <div className="mb-7 flex flex-col items-center gap-2">
      <div className="flex size-16 items-center justify-center rounded-2xl border border-violet-500/40 bg-violet-500/15 shadow-lg shadow-violet-500/20">
        <svg viewBox="0 0 64 80" fill="none" width="36" height="44" aria-hidden="true">
          <rect x="14" y="9" width="36" height="26" rx="7" fill="#4c3a91" stroke="#2a1f5e" strokeWidth="1.5"/>
          <circle cx="26" cy="22" r="6" fill="#f5c518"/><circle cx="42" cy="22" r="6" fill="#f5c518"/>
          <circle cx="26" cy="22" r="3.2" fill="#1a1230"/><circle cx="42" cy="22" r="3.2" fill="#1a1230"/>
          <circle cx="27.4" cy="20.5" r="1.3" fill="white" opacity="0.9"/><circle cx="43.4" cy="20.5" r="1.3" fill="white" opacity="0.9"/>
          <rect x="10" y="41" width="44" height="28" rx="7" fill="#4c3a91" stroke="#2a1f5e" strokeWidth="1.5"/>
          <rect x="19" y="49" width="24" height="14" rx="3.5" fill="#3d2f7a" stroke="#2a1f5e" strokeWidth="1"/>
          <circle cx="26" cy="56" r="2.8" fill="#4fc3f7" opacity="0.9"/>
          <circle cx="32" cy="56" r="2" fill="#f5c518" opacity="0.75"/>
        </svg>
      </div>
      <p className="text-base font-black tracking-wide text-white">Maylo</p>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Asistente operativo · Operux CRM</p>
    </div>
  );
}

const errorMsg: Record<string, string> = {
  invalid: "Datos incompletos o formato inválido.",
  auth: "El usuario no existe o la contraseña no coincide.",
  profile: "La cuenta existe pero no tiene perfil interno vinculado.",
  inactive: "La cuenta o el comercio están inactivos.",
  rate: "Demasiados intentos fallidos. Intenta nuevamente en 5 minutos.",
};

export default function LoginPage({ searchParams }: { searchParams: { next?: string; error?: string } }) {
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryMsg, setRecoveryMsg] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function sendRecovery(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.resetPasswordForEmail(recoveryEmail.trim(), { redirectTo: `${window.location.origin}/cambiar-clave` });
    setRecoveryMsg("Si el correo existe recibirás un enlace de recuperación");
    setSending(false);
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#050709] p-4">
      <AtomCanvas />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(0,206,201,0.07),transparent),radial-gradient(ellipse_60%_60%_at_50%_100%,rgba(108,92,231,0.07),transparent)]" />
      <MayloBg />
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl border border-white/15 bg-white/8 p-8 shadow-2xl shadow-violet-950/40 backdrop-blur-xl">
          <div className="mb-7 text-center">
            <h1 className="text-3xl font-black tracking-tight text-white">Operux</h1>
            <p className="mt-2 text-sm font-semibold text-white/50">Tu negocio, en orden.</p>
          </div>
          {searchParams.error && <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-400">{errorMsg[searchParams.error] || "No se pudo iniciar sesión."}</p>}
          <form action={loginAction} className="grid gap-4">
            <input type="hidden" name="next" value={searchParams.next || ""} />
            <label className="grid gap-2 text-xs font-bold uppercase tracking-wide text-slate-300">Email<input className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/60" name="email" type="email" required placeholder="tu@correo.com" /></label>
            <label className="grid gap-2 text-xs font-bold uppercase tracking-wide text-slate-300">Contraseña<span className="relative"><input className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 pr-12 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/60" name="password" type={showPassword ? "text" : "password"} minLength={8} required placeholder="Mínimo 8 caracteres" /><button className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:text-white" type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></span></label>
            <button className="-mt-2 w-fit text-xs font-bold text-cyan-300 transition hover:text-cyan-100" type="button" onClick={() => setModalOpen(true)}>¿Olvidaste tu contraseña?</button>
            <label className="flex items-start gap-3 text-xs normal-case leading-5 text-slate-300">
              <input
                className="mt-0.5 size-4 shrink-0 accent-cyan-500"
                type="checkbox"
                name="terms"
                value="accepted"
                checked={termsAccepted}
                onChange={(event) => setTermsAccepted(event.target.checked)}
                required
              />
              <span>
                Acepto los{" "}
                <a className="font-bold text-cyan-300 hover:text-cyan-100" href="/terminos" target="_blank" rel="noopener noreferrer">
                  Términos y Condiciones
                </a>{" "}
                y la{" "}
                <a className="font-bold text-cyan-300 hover:text-cyan-100" href="/privacidad" target="_blank" rel="noopener noreferrer">
                  Política de Tratamiento de Datos
                </a>
              </span>
            </label>
            <button className="mt-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-violet-500/25 transition hover:scale-[1.02] hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100" type="submit" disabled={!termsAccepted}>Entrar al sistema</button>
          </form>
          <p className="mt-6 text-center text-[10px] font-semibold text-white/35">
            <a className="hover:text-white/70" href="/terminos">Términos</a>
            {" · "}
            <a className="hover:text-white/70" href="/privacidad">Tratamiento de datos</a>
          </p>
        </div>
        {/* Maylo asomándose desde la esquina inferior derecha del card */}
        <span
          className="maylo-float-svg pointer-events-none"
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: -60,
            right: -50,
            width: 100,
            height: 100,
            display: "block",
            animation: "mayloFloat 2.4s ease-in-out infinite",
          }}
          dangerouslySetInnerHTML={{ __html: generateMaylo({ eyes: 'happy', arms: 'wave', glow: true }) }}
        />
      </div>
      {modalOpen && <div className="fixed inset-0 z-30 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm"><form className="w-full max-w-md rounded-3xl border border-white/15 bg-slate-950 p-6 shadow-2xl" onSubmit={sendRecovery}><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-black text-white">Recuperar contraseña</h2><button className="rounded-xl border border-white/10 p-2 text-white/60 hover:text-white" type="button" onClick={() => setModalOpen(false)} aria-label="Cerrar"><X className="size-4" /></button></div><label className="mt-5 grid gap-2 text-xs font-bold uppercase tracking-wide text-slate-300">Email<input className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/60" type="email" required value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} placeholder="tu@correo.com" /></label>{recoveryMsg && <p className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-300">{recoveryMsg}</p>}<button className="mt-5 w-full rounded-xl bg-cyan-500 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60" type="submit" disabled={sending}>{sending ? "Enviando..." : "Enviar código"}</button></form></div>}
    </main>
  );
}
