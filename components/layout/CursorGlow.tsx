"use client";

import { useEffect, useState } from "react";

export function CursorGlow() {
  const [pos, setPos] = useState({ x: -500, y: -500 });

  useEffect(() => {
    function move(e: MouseEvent) {
      setPos({ x: e.clientX, y: e.clientY });
    }

    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] hidden md:block"
      style={{
        background: `radial-gradient(300px circle at ${pos.x}px ${pos.y}px, rgba(var(--brand-primary-rgb,124,58,237),0.08), transparent 62%)`,
      }}
    />
  );
}
