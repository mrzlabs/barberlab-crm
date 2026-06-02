"use client";

import { useEffect, useRef, useState } from "react";
import { MrzModal } from "@/components/layout/MrzModal";

export function MrzSignature() {
  const sigRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [open, setOpen] = useState(false);

  // Neural canvas animation
  useEffect(() => {
    const sigEl = sigRef.current;
    const cvEl = canvasRef.current;
    const ctxRaw = cvEl?.getContext("2d");
    if (!sigEl || !cvEl || !ctxRaw) return;
    const sig = sigEl;
    const cv = cvEl;
    const ctx = ctxRaw;

    let w = 0;
    const h = 80;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const qty = 60;
    const maxDist = 120;
    const parts: Array<{ x: number; y: number; vx: number; vy: number; r: number; p: number }> = [];
    const pulses: Array<{ a: number; b: number; t: number; d: number }> = [];
    let raf = 0;

    function fit() {
      const rect = sig.getBoundingClientRect();
      w = rect.width || window.innerWidth;
      cv.width = w * dpr;
      cv.height = h * dpr;
      cv.style.width = `${w}px`;
      cv.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      parts.length = 0;
      for (let i = 0; i < qty; i += 1) {
        parts.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.12,
          r: 1 + Math.random() * 1.2,
          p: Math.random() * Math.PI * 2,
        });
      }
    }

    function spawn() {
      const a = Math.floor(Math.random() * parts.length);
      const near: number[] = [];
      for (let i = 0; i < parts.length; i += 1) {
        if (i === a) continue;
        const dx = parts[a].x - parts[i].x;
        const dy = parts[a].y - parts[i].y;
        if (dx * dx + dy * dy < maxDist * maxDist) near.push(i);
      }
      if (near.length) pulses.push({ a, b: near[Math.floor(Math.random() * near.length)], t: 0, d: 1200 + Math.random() * 1500 });
    }

    fit();
    seed();
    const ro = new ResizeObserver(() => { fit(); seed(); });
    ro.observe(sig);

    let last = performance.now();
    let pulseTimer = 0;
    function tick(now: number) {
      const dt = now - last;
      last = now;
      pulseTimer += dt;
      if (pulseTimer > 300) { spawn(); pulseTimer = 0; }

      ctx.clearRect(0, 0, w, h);
      parts.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.p += 0.012;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      });

      for (let i = 0; i < parts.length; i += 1) {
        for (let j = i + 1; j < parts.length; j += 1) {
          const dx = parts[i].x - parts[j].x;
          const dy = parts[i].y - parts[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 > maxDist * maxDist) continue;
          const alpha = (1 - Math.sqrt(d2) / maxDist) * 0.18;
          ctx.strokeStyle = `rgba(192,132,252,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(parts[i].x, parts[i].y);
          ctx.lineTo(parts[j].x, parts[j].y);
          ctx.stroke();
        }
      }

      for (let i = pulses.length - 1; i >= 0; i -= 1) {
        const pulse = pulses[i];
        pulse.t += dt;
        const g = pulse.t / pulse.d;
        if (g >= 1) { pulses.splice(i, 1); continue; }
        const a = parts[pulse.a];
        const b = parts[pulse.b];
        const x = a.x + (b.x - a.x) * g;
        const y = a.y + (b.y - a.y) * g;
        const f = Math.sin(g * Math.PI);
        ctx.strokeStyle = `rgba(216,180,254,${0.32 * f})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        ctx.fillStyle = `rgba(56,248,214,${0.8 * f})`;
        ctx.shadowColor = "rgba(56,248,214,.8)"; ctx.shadowBlur = 9;
        ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }

      parts.forEach((p) => {
        const b = 0.48 + Math.sin(p.p) * 0.22;
        ctx.fillStyle = `rgba(237,224,255,${0.52 * b})`;
        ctx.shadowColor = "rgba(192,132,252,.6)"; ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      });

      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <>
      {/* ── Firma fija al fondo de pantalla ─────────────────────── */}
      <div className="build-sig" ref={sigRef}>
        <canvas className="build-neural-canvas" ref={canvasRef} aria-hidden="true" />

        {/* Contenedor del footer — dos filas apiladas */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 4,
            pointerEvents: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}
        >
          {/* LÍNEA 1: Eslogan */}
          <p
            style={{
              margin: 0,
              padding: "0 20px 5px",
              textAlign: "center",
              fontSize: "0.6rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Automatizamos tu negocio · Agenda, caja, inventario y reportes en un solo lugar · MRZLABS
          </p>

          {/* LÍNEA 2: Separador */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", margin: "0 20px" }} />

          {/* LÍNEA 3: Datos principales */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              alignItems: "center",
              gap: "12px",
              padding: "6px 20px 10px",
            }}
          >
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.5)",
                whiteSpace: "nowrap",
                textAlign: "left",
              }}
            >
              © 2026 Todos los derechos reservados
            </span>

            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Ver información de BARBERLABS"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#00cec9",
                textShadow: "0 0 12px rgba(0,206,201,0.6)",
                padding: "4px 10px",
                borderRadius: "999px",
                transition: "text-shadow 0.2s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.textShadow = "0 0 22px rgba(0,206,201,0.9)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.textShadow = "0 0 12px rgba(0,206,201,0.6)"; }}
            >
              BARBERLABS
            </button>

            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Ver información de MRZLABS"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.5)",
                textAlign: "right",
                whiteSpace: "nowrap",
              }}
            >
              Built by MRZLABS
            </button>
          </div>
        </div>
      </div>

      <MrzModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
