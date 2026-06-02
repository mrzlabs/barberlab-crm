"use client";

import { useEffect, useRef } from "react";
import { loginAction } from "./actions";

// ─── Canvas de partículas atómicas ────────────────────────────────────────────

function AtomCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    if (!ctx) return;

    let w = 0, h = 0, raf = 0;
    const CYAN   = [0, 206, 201];
    const VIOLET = [108, 92, 231];
    const QTY = 60;

    type Particle = { x: number; y: number; vx: number; vy: number; r: number; p: number; orbitR: number; orbitSpeed: number; orbitAngle: number; cx: number; cy: number };
    const parts: Particle[] = [];

    function lerp(a: number[], b: number[], t: number) {
      return a.map((v, i) => Math.round(v + (b[i] - v) * t));
    }

    function resize() {
      if (!cv) return;
      w = cv.width  = cv.offsetWidth;
      h = cv.height = cv.offsetHeight;
      parts.length = 0;
      for (let i = 0; i < QTY; i++) {
        const orbitR = 20 + Math.random() * 60;
        parts.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.12,
          r: 2 + Math.random() * 3,
          p: Math.random() * Math.PI * 2,
          orbitR,
          orbitSpeed: (Math.random() > 0.5 ? 1 : -1) * (0.002 + Math.random() * 0.004),
          orbitAngle: Math.random() * Math.PI * 2,
          cx: Math.random() * w,
          cy: Math.random() * h,
        });
      }
    }

    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    resize();

    function tick() {
      ctx.clearRect(0, 0, w, h);

      // Move centers slowly
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

      // Lines between nearby nodes
      const MAX_DIST = 110;
      for (let i = 0; i < parts.length; i++) {
        for (let j = i + 1; j < parts.length; j++) {
          const dx = parts[i].x - parts[j].x;
          const dy = parts[i].y - parts[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 > MAX_DIST * MAX_DIST) continue;
          const t = i / parts.length;
          const [r, g, b] = lerp(CYAN, VIOLET, t);
          const alpha = (1 - Math.sqrt(d2) / MAX_DIST) * 0.18;
          ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(parts[i].x, parts[i].y);
          ctx.lineTo(parts[j].x, parts[j].y);
          ctx.stroke();
        }
      }

      // Dots
      parts.forEach((p, i) => {
        const t = i / parts.length;
        const [r, g, b] = lerp(CYAN, VIOLET, t);
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
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}

// ─── Logo SVG BL ──────────────────────────────────────────────────────────────

function BLLogo() {
  return (
    <div className="relative mx-auto mb-6 flex size-20 items-center justify-center">
      <svg viewBox="0 0 80 80" fill="none" className="absolute inset-0 size-full drop-shadow-[0_0_18px_rgba(0,206,201,0.5)]" aria-hidden="true">
        <defs>
          <linearGradient id="blg" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00cec9" />
            <stop offset="1" stopColor="#6c5ce7" />
          </linearGradient>
        </defs>
        <rect width="80" height="80" rx="22" fill="url(#blg)" opacity="0.15" />
        <rect width="80" height="80" rx="22" stroke="url(#blg)" strokeWidth="1.5" fill="none" />
        <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="url(#blg)" fontSize="32" fontWeight="900" fontFamily="Inter, sans-serif" letterSpacing="-1">BL</text>
      </svg>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

const errorMsg: Record<string, string> = {
  invalid:  "Datos incompletos o formato inválido.",
  auth:     "El usuario no existe o la contraseña no coincide.",
  profile:  "La cuenta existe pero no tiene perfil interno vinculado.",
  inactive: "La cuenta o el comercio están inactivos.",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
}) {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#050709] p-4">
      {/* Canvas fondo */}
      <AtomCanvas />

      {/* Overlay gradiente sutil */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(0,206,201,0.07),transparent),radial-gradient(ellipse_60%_60%_at_50%_100%,rgba(108,92,231,0.07),transparent)]" />

      {/* Card principal */}
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl border border-white/15 bg-white/8 p-8 shadow-2xl shadow-violet-950/40 backdrop-blur-xl">
          <BLLogo />

          <p className="mb-6 text-center text-base leading-7 text-white/80">
            Estás por ingresar al sistema top integrado de gestión para tu negocio
          </p>

          {searchParams.error ? (
            <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-400">
              {errorMsg[searchParams.error] || "No se pudo iniciar sesión."}
            </p>
          ) : (
            <div className="mb-4 grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-center text-[10px] font-black uppercase tracking-widest text-white/50">
              <span>Auth</span>
              <span>Perfil</span>
              <span>Rol activo</span>
            </div>
          )}

          <form action={loginAction} className="grid gap-4">
            <input type="hidden" name="next" value={searchParams.next || ""} />

            <label className="grid gap-2 text-xs font-bold uppercase tracking-wide text-slate-300">
              Email
              <input
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/60"
                name="email"
                type="email"
                required
                placeholder="tu@correo.com"
              />
            </label>

            <label className="grid gap-2 text-xs font-bold uppercase tracking-wide text-slate-300">
              Contraseña
              <input
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/60"
                name="password"
                type="password"
                minLength={8}
                required
                placeholder="••••••••"
              />
            </label>

            <button
              className="mt-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-violet-500/25 transition hover:scale-[1.02] hover:opacity-95"
              type="submit"
            >
              Entrar al sistema
            </button>
          </form>

          <p className="mt-6 text-center text-[10px] font-semibold text-white/25">
            BarberLab CRM · Gestión integral para tu negocio
          </p>
        </div>
      </div>
    </main>
  );
}
