"use client";

import { useEffect, useRef } from "react";

export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function move(e: MouseEvent) {
      if (!ref.current) return;
      ref.current.style.background = `radial-gradient(300px circle at ${e.clientX}px ${e.clientY}px, rgba(var(--brand-primary-rgb,124,58,237),0.08), transparent 62%)`;
    }
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] hidden md:block"
    />
  );
}
