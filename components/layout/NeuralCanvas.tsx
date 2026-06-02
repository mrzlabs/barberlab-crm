"use client";

import { useEffect, useRef } from "react";

type Particle = { x: number; y: number; vx: number; vy: number; r: number; phase: number };
type Pulse    = { a: number; b: number; t: number; dur: number };

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map(c => c + c).join("") : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return `rgba(124,58,237,${alpha})`;
  return `rgba(${r},${g},${b},${alpha})`;
}

interface NeuralCanvasProps {
  className?: string;
  darkMode?: boolean;
  primaryColor?: string;
}

export function NeuralCanvas({ className = "", darkMode, primaryColor }: NeuralCanvasProps) {
  const cvRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cvEl = cvRef.current;
    if (!cvEl) return;
    const ctxRaw = cvEl.getContext("2d");
    if (!ctxRaw) return;

    const cv: HTMLCanvasElement = cvEl;
    const ctx: CanvasRenderingContext2D = ctxRaw;

    const dpr  = Math.min(window.devicePixelRatio || 1, 2);
    const QTY  = 52;
    const DIST = 140;
    const parts: Particle[] = [];
    const pulses: Pulse[]   = [];
    let raf    = 0;
    let last   = performance.now();
    let pTimer = 0;
    let W = 0, H = 0;
    let frameCount = 0;

    // Theme vars — prefer props, fall back to CSS custom props on documentElement
    let isDarkMode = darkMode ?? true;
    let brandColor = primaryColor ?? "#7c3aed";

    function readThemeVars() {
      if (darkMode !== undefined) {
        isDarkMode = darkMode;
      } else {
        const root = document.documentElement;
        const cs = getComputedStyle(root);
        const opacity = cs.getPropertyValue("--neural-opacity").trim();
        isDarkMode = opacity ? parseFloat(opacity) >= 0.5 : true;
      }
      if (primaryColor !== undefined) {
        brandColor = primaryColor;
      } else {
        const root = document.documentElement;
        const p = getComputedStyle(root).getPropertyValue("--neural-primary").trim();
        brandColor = p || "#7c3aed";
      }
    }

    // Per-mode opacity targets
    function lineAlpha(proximity: number) {
      const base = isDarkMode ? 0.5 : 0.3;
      return proximity * base;
    }
    function particleAlpha(breathing: number) {
      return breathing * (isDarkMode ? 0.6 : 0.4);
    }
    function pulseLineAlpha(bright: number) {
      return 0.38 * bright * (isDarkMode ? 1 : 0.7);
    }
    function pulseDotAlpha(bright: number) {
      return 0.88 * bright * (isDarkMode ? 1 : 0.7);
    }

    function resize() {
      W = cv.offsetWidth  || window.innerWidth;
      H = cv.offsetHeight || window.innerHeight;
      cv.width  = W * dpr;
      cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function seed() {
      parts.length = 0;
      for (let i = 0; i < QTY; i++) {
        parts.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.11, vy: (Math.random() - 0.5) * 0.11,
          r: 1 + Math.random() * 1.3,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    function spawnPulse() {
      const a = Math.floor(Math.random() * parts.length);
      const near: number[] = [];
      for (let i = 0; i < parts.length; i++) {
        if (i === a) continue;
        const dx = parts[a].x - parts[i].x, dy = parts[a].y - parts[i].y;
        if (dx * dx + dy * dy < DIST * DIST) near.push(i);
      }
      if (near.length) pulses.push({ a, b: near[Math.floor(Math.random() * near.length)], t: 0, dur: 1100 + Math.random() * 1600 });
    }

    resize();
    readThemeVars();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);

    function tick(now: number) {
      frameCount++;
      if (frameCount % 60 === 0) readThemeVars();
      const dt = now - last; last = now;
      pTimer += dt;
      if (pTimer > 280) { spawnPulse(); pTimer = 0; }

      ctx.clearRect(0, 0, W, H);

      for (const p of parts) {
        p.x += p.vx; p.y += p.vy; p.phase += 0.01;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      }

      // Lines — brand color, per-mode opacity
      for (let i = 0; i < parts.length; i++) {
        for (let j = i + 1; j < parts.length; j++) {
          const dx = parts[i].x - parts[j].x, dy = parts[i].y - parts[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 > DIST * DIST) continue;
          const proximity = 1 - Math.sqrt(d2) / DIST;
          ctx.strokeStyle = hexToRgba(brandColor, lineAlpha(proximity));
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(parts[i].x, parts[i].y);
          ctx.lineTo(parts[j].x, parts[j].y);
          ctx.stroke();
        }
      }

      // Pulses — brand-tinted cyan
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pu = pulses[i]; pu.t += dt;
        const g = pu.t / pu.dur;
        if (g >= 1) { pulses.splice(i, 1); continue; }
        const pa = parts[pu.a], pb = parts[pu.b];
        const px = pa.x + (pb.x - pa.x) * g;
        const py = pa.y + (pb.y - pa.y) * g;
        const bright = Math.sin(g * Math.PI);
        ctx.strokeStyle = hexToRgba(brandColor, pulseLineAlpha(bright));
        ctx.lineWidth = 1.1;
        ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
        ctx.fillStyle = `rgba(56,248,214,${pulseDotAlpha(bright)})`;
        ctx.shadowColor = "rgba(56,248,214,.8)"; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(px, py, 2.1, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Particles — brand color, per-mode opacity, breathing
      for (const p of parts) {
        const b = 0.5 + Math.sin(p.phase) * 0.25;
        ctx.fillStyle = hexToRgba(brandColor, particleAlpha(b));
        ctx.shadowColor = hexToRgba(brandColor, 0.5); ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }

      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [darkMode, primaryColor]);

  return (
    <canvas
      ref={cvRef}
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
    />
  );
}
