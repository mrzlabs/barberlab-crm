"use client";

import { useEffect, useRef, useState } from "react";
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

function BLLogo() {
  return (
    <div className="relative mx-auto mb-6 flex size-20 items-center justify-center">
      <svg viewBox="0 0 80 80" fill="none" className="absolute inset-0 size-full drop-shadow-[0_0_18px_rgba(0,206,201,0.5)]" aria-hidden="true">
        <defs><linearGradient id="blg" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse"><stop stopColor="#00cec9" /><stop offset="1" stopColor="#6c5ce7" /></linearGradient></defs>
        <rect width="80" height="80" rx="22" fill="url(#blg)" opacity="0.15" />
        <rect width="80" height="80" rx="22" stroke="url(#blg)" strokeWidth="1.5" fill="none" />
        <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="url(#blg)" fontSize="32" fontWeight="900" fontFamily="Inter, sans-serif" letterSpacing="-1">BL</text>
      </svg>
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
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl border border-white/15 bg-white/8 p-8 shadow-2xl shadow-violet-950/40 backdrop-blur-xl">
          <BLLogo />
          <p className="mb-6 text-center text-base leading-7 text-white/80">Estás por ingresar al sistema top integrado de gestión para tu negocio</p>
          {searchParams.error ? <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-400">{errorMsg[searchParams.error] || "No se pudo iniciar sesión."}</p> : <div className="mb-4 grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-center text-[10px] font-black uppercase tracking-widest text-white/50"><span>Auth</span><span>Perfil</span><span>Rol activo</span></div>}
          <form action={loginAction} className="grid gap-4">
            <input type="hidden" name="next" value={searchParams.next || ""} />
            <label className="grid gap-2 text-xs font-bold uppercase tracking-wide text-slate-300">Email<input className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/60" name="email" type="email" required placeholder="tu@correo.com" /></label>
            <label className="grid gap-2 text-xs font-bold uppercase tracking-wide text-slate-300">Contraseña<span className="relative"><input className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 pr-12 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/60" name="password" type={showPassword ? "text" : "password"} minLength={8} required placeholder="Mínimo 8 caracteres" /><button className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:text-white" type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></span></label>
            <button className="-mt-2 w-fit text-xs font-bold text-cyan-300 transition hover:text-cyan-100" type="button" onClick={() => setModalOpen(true)}>¿Olvidaste tu contraseña?</button>
            <button className="mt-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-violet-500/25 transition hover:scale-[1.02] hover:opacity-95" type="submit">Entrar al sistema</button>
          </form>
          <p className="mt-6 text-center text-[10px] font-semibold text-white/25">BarberLab CRM · Gestión integral para tu negocio</p>
        </div>
      </div>
      {modalOpen && <div className="fixed inset-0 z-30 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm"><form className="w-full max-w-md rounded-3xl border border-white/15 bg-slate-950 p-6 shadow-2xl" onSubmit={sendRecovery}><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-black text-white">Recuperar contraseña</h2><button className="rounded-xl border border-white/10 p-2 text-white/60 hover:text-white" type="button" onClick={() => setModalOpen(false)} aria-label="Cerrar"><X className="size-4" /></button></div><label className="mt-5 grid gap-2 text-xs font-bold uppercase tracking-wide text-slate-300">Email<input className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/60" type="email" required value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} placeholder="tu@correo.com" /></label>{recoveryMsg && <p className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-300">{recoveryMsg}</p>}<button className="mt-5 w-full rounded-xl bg-cyan-500 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60" type="submit" disabled={sending}>{sending ? "Enviando..." : "Enviar código"}</button></form></div>}
    </main>
  );
}
