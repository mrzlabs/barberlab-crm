"use client";

import { useEffect, useRef, useState } from "react";
import { MrzModal } from "@/components/layout/MrzModal";
import type { ReactNode } from "react";

export function MrzSignature({ bot }: { bot?: ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sigRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const cvEl = canvasRef.current;
    const sigEl = sigRef.current;
    const ctxRaw = cvEl?.getContext("2d");
    if (!cvEl || !sigEl || !ctxRaw) return;
    const cv = cvEl;
    const ctx = ctxRaw;
    let w = 0;
    const h = 72;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const parts: Array<{ x: number; y: number; vx: number; vy: number; r: number; p: number }> = [];
    const pulses: Array<{ a: number; b: number; t: number; d: number }> = [];
    const qty = 55;
    const maxDist = 110;
    let raf = 0;

    function fit() {
      w = sigEl!.getBoundingClientRect().width || window.innerWidth;
      cv.width = w * dpr;
      cv.height = h * dpr;
      cv.style.width = `${w}px`;
      cv.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function seed() {
      parts.length = 0;
      for (let i = 0; i < qty; i++) {
        parts.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.11, vy: (Math.random() - 0.5) * 0.11, r: 1 + Math.random() * 1.2, p: Math.random() * Math.PI * 2 });
      }
    }
    function spawn() {
      const a = Math.floor(Math.random() * parts.length);
      const near: number[] = [];
      for (let i = 0; i < parts.length; i++) {
        if (i === a) continue;
        const dx = parts[a].x - parts[i].x, dy = parts[a].y - parts[i].y;
        if (dx*dx + dy*dy < maxDist*maxDist) near.push(i);
      }
      if (near.length) pulses.push({ a, b: near[Math.floor(Math.random() * near.length)], t: 0, d: 1200 + Math.random() * 1400 });
    }

    fit(); seed();
    const ro = new ResizeObserver(() => { fit(); seed(); });
    ro.observe(sigEl);

    let last = performance.now(), pulseTimer = 0;
    function tick(now: number) {
      const dt = now - last; last = now; pulseTimer += dt;
      if (pulseTimer > 320) { spawn(); pulseTimer = 0; }
      ctx.clearRect(0, 0, w, h);
      parts.forEach(p => { p.x += p.vx; p.y += p.vy; p.p += 0.012; if (p.x < 0 || p.x > w) p.vx *= -1; if (p.y < 0 || p.y > h) p.vy *= -1; });
      for (let i = 0; i < parts.length; i++) for (let j = i+1; j < parts.length; j++) {
        const dx = parts[i].x-parts[j].x, dy = parts[i].y-parts[j].y, d2 = dx*dx+dy*dy;
        if (d2 > maxDist*maxDist) continue;
        ctx.strokeStyle = `rgba(192,132,252,${(1 - Math.sqrt(d2)/maxDist) * 0.16})`; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(parts[i].x, parts[i].y); ctx.lineTo(parts[j].x, parts[j].y); ctx.stroke();
      }
      for (let i = pulses.length-1; i >= 0; i--) {
        const pulse = pulses[i]; pulse.t += dt;
        const g = pulse.t / pulse.d;
        if (g >= 1) { pulses.splice(i, 1); continue; }
        const a = parts[pulse.a], b = parts[pulse.b];
        const f = Math.sin(g * Math.PI);
        ctx.strokeStyle = `rgba(216,180,254,${0.3*f})`; ctx.lineWidth = 0.9;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        const x = a.x + (b.x-a.x)*g, y = a.y + (b.y-a.y)*g;
        ctx.fillStyle = `rgba(56,248,214,${0.75*f})`; ctx.shadowColor = "rgba(56,248,214,.7)"; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
      }
      parts.forEach(p => {
        const b = 0.48 + Math.sin(p.p) * 0.22;
        ctx.fillStyle = `rgba(237,224,255,${0.48*b})`; ctx.shadowColor = "rgba(192,132,252,.55)"; ctx.shadowBlur = 5;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
      });
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div
      ref={sigRef}
      style={{
        position: "relative",
        width: "100%",
        height: "72px",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(4,4,14,0.7)",
        overflow: "hidden",
      }}
    >
      {/* Canvas neural */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "72px", mixBlendMode: "screen", opacity: 0.65 }}
      />

      {/* Bot — esquina derecha del footer */}
      {bot && (
        <div style={{ position: "absolute", inset: 0, zIndex: 6, pointerEvents: "none" }}>
          {bot}
        </div>
      )}

      {/* Contenido del footer */}
      <div
        style={{
          position: "relative",
          zIndex: 4,
          height: "100%",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          padding: "0 80px 0 20px", // dejar espacio para el bot
          gap: 12,
        }}
      >
        {/* Eslogan arriba */}
      </div>

      {/* Fila inferior: copyright | BARBERLABS | Built by */}
      <div
        style={{
          position: "absolute",
          bottom: 10,
          left: 20,
          right: 80,
          zIndex: 4,
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span style={{ fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.07em", color: "rgba(255,255,255,0.42)", whiteSpace: "nowrap" }}>
          © 2026 Todos los derechos reservados
        </span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#00cec9", textShadow: "0 0 10px rgba(0,206,201,0.55)", padding: "2px 8px" }}
        >
          OPERUX
        </button>
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "rgba(255,255,255,0.42)", textAlign: "right", whiteSpace: "nowrap" }}
        >
          Built by MRZLABS
        </button>
      </div>

      <MrzModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
