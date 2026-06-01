"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

export function MrzSignature() {
  const sigRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sigEl = sigRef.current;
    const cvEl = canvasRef.current;
    const ctxRaw = cvEl?.getContext("2d");
    if (!sigEl || !cvEl || !ctxRaw) return;
    const sig = sigEl;
    const cv = cvEl;
    const ctx = ctxRaw;

    let w = 0;
    const h = 172;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const qty = 72;
    const maxDist = 128;
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
          vx: (Math.random() - 0.5) * 0.13,
          vy: (Math.random() - 0.5) * 0.13,
          r: 1 + Math.random() * 1.35,
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
    const ro = new ResizeObserver(() => {
      fit();
      seed();
    });
    ro.observe(sig);

    let last = performance.now();
    let pulseTimer = 0;
    function tick(now: number) {
      const dt = now - last;
      last = now;
      pulseTimer += dt;
      if (pulseTimer > 300) {
        spawn();
        pulseTimer = 0;
      }

      ctx.clearRect(0, 0, w, h);
      parts.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.p += 0.012;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      });

      for (let i = 0; i < parts.length; i += 1) {
        for (let j = i + 1; j < parts.length; j += 1) {
          const dx = parts[i].x - parts[j].x;
          const dy = parts[i].y - parts[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 > maxDist * maxDist) continue;
          const alpha = (1 - Math.sqrt(d2) / maxDist) * 0.2;
          ctx.strokeStyle = `rgba(192,132,252,${alpha})`;
          ctx.lineWidth = 0.58;
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
        if (g >= 1) {
          pulses.splice(i, 1);
          continue;
        }
        const a = parts[pulse.a];
        const b = parts[pulse.b];
        const x = a.x + (b.x - a.x) * g;
        const y = a.y + (b.y - a.y) * g;
        const f = Math.sin(g * Math.PI);
        ctx.strokeStyle = `rgba(216,180,254,${0.38 * f})`;
        ctx.lineWidth = 1.15;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.fillStyle = `rgba(56,248,214,${0.84 * f})`;
        ctx.shadowColor = "rgba(56,248,214,.84)";
        ctx.shadowBlur = 11;
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      parts.forEach((p) => {
        const b = 0.48 + Math.sin(p.p) * 0.22;
        ctx.fillStyle = `rgba(237,224,255,${0.58 * b})`;
        ctx.shadowColor = "rgba(192,132,252,.68)";
        ctx.shadowBlur = 7;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
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

  return (
    <div className={`build-sig ${open ? "open" : ""}`} ref={sigRef}>
      <canvas className="build-neural-canvas" ref={canvasRef} aria-hidden="true" />
      <div className="mrz-build-map" aria-hidden="true">
        <svg className="net-routes" viewBox="0 0 1000 190" preserveAspectRatio="none">
          {[
            "M20 118 C80 28 126 175 194 86 S328 12 390 96 S514 172 590 72 S724 12 808 104 S930 178 980 54",
            "M48 146 C132 70 196 210 270 138 S386 50 472 116 S612 174 694 84 S836 42 964 132",
            "M18 78 C98 156 152 18 236 54 S340 150 430 40 S558 140 650 52 S772 176 862 44 S940 24 988 98",
            "M6 48 C96 12 132 96 214 58 S338 4 414 62 S548 122 618 42 S754 14 832 82 S922 126 1000 44",
            "M12 166 C108 98 172 184 258 128 S398 72 480 142 S616 182 708 112 S846 78 990 154",
          ].map((d, i) => <path className="on" d={d} key={d} style={{ animationDelay: `${i * 0.9}s` }} />)}
        </svg>
      </div>
      <div className="ctn build-card">
        <button className="build-chip" type="button" onClick={() => setOpen(true)}>Built by mrzlabs</button>
        <div className="build-overlay" aria-hidden={!open}>
          <div className="build-modal">
            <button className="build-close" type="button" onClick={() => setOpen(false)} aria-label="Cerrar"><X className="size-4" /></button>
            <div>
              <strong>Arquitectura progresiva</strong>
              <p>Infraestructura digital escalable para comercios que quieren operar con datos, roles y evidencia.</p>
              <ol>
                <li>Analizamos operación, agenda, caja e inventario.</li>
                <li>Diseñamos flujos por rol y permisos.</li>
                <li>Construimos módulos medibles.</li>
                <li>Dejamos reportes para decidir con margen real.</li>
              </ol>
            </div>
            <div>
              <strong>MRZLABS</strong>
              <p>Producto CRM modular para barberías, salones y comercios de atención por agenda.</p>
              <div className="build-links">
                <a href="https://github.com/mrzlabs" target="_blank" rel="noreferrer">GitHub</a>
                <a href="https://mrzlabs.github.io/web-mrz-portfolio/" target="_blank" rel="noreferrer">Portafolio</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
