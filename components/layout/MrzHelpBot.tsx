"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Search, X } from "lucide-react";
import { generateMaylo } from "@/lib/maylo";

function BotRobot() {
  return (
    <span
      className="bot-robot-svg"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: generateMaylo({ eyes: 'open', arms: 'wave', glow: true }) }}
    />
  );
}

type HelpTopic = {
  title: string;
  body: string;
  steps: string[];
  tips?: string[];
  cta?: string;
  href?: string;
};

export function MrzHelpBot({ topics }: { topics: HelpTopic[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [botX, setBotX] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [zoneWidth, setZoneWidth] = useState(0);
  const zoneRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone) return;
    const readWidth = () => setZoneWidth(zone.getBoundingClientRect().width);
    readWidth();
    const ro = new ResizeObserver(readWidth);
    ro.observe(zone);
    return () => ro.disconnect();
  }, []);

  // Movimiento suave horizontal dentro de toda la firma
  useEffect(() => {
    if (open) return;
    const travel = Math.max(0, zoneWidth - 110);
    const targets = [0, -travel * 0.22, -travel * 0.48, -travel * 0.76, -travel * 0.34, -travel * 0.62, -travel * 0.12];
    let idx = 0;
    const id = window.setInterval(() => {
      idx = (idx + 1) % targets.length;
      setBotX(targets[idx]);
    }, 4200);
    return () => window.clearInterval(id);
  }, [open, zoneWidth]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return topics;
    return topics.filter((topic) => [
      topic.title, topic.body, ...topic.steps, ...(topic.tips ?? []),
    ].join(" ").toLowerCase().includes(term));
  }, [query, topics]);

  const topic = filtered[active] ?? filtered[0] ?? topics[0];
  useEffect(() => { setActive(0); }, [query]);

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const panel = open && mounted
    ? createPortal(
        <div
          ref={panelRef}
          className="mrz-help-panel"
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            width: "min(94vw, 480px)",
            maxHeight: "100dvh",
            zIndex: 260,
            borderRadius: "1.25rem 0 0 1.25rem",
            animation: "mayloSlideIn 0.28s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <div className="mrz-help-head">
            <div>
              <p>Maylo · Operux CRM</p>
              <h3>Hola, soy Maylo</h3>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar ayuda">
              <X className="size-4" />
            </button>
          </div>
          <label className="mrz-help-search">
            <Search className="size-4" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Pregúntale a Maylo..." />
          </label>
          <div className="mrz-help-body">
            <div className="mrz-help-list">
              {filtered.map((item, i) => (
                <button className={i === active ? "active" : ""} key={item.title} onClick={() => setActive(i)} type="button">
                  <span>{item.title}</span>
                  <small>{item.steps.length} pasos</small>
                </button>
              ))}
              {filtered.length === 0 && <p className="mrz-help-empty">Sin coincidencias.</p>}
            </div>
            {topic && (
              <article className="mrz-help-topic">
                <strong>{topic.title}</strong>
                <p>{topic.body}</p>
                <ol>
                  {topic.steps.map((step) => <li key={step}>{step}</li>)}
                </ol>
                {topic.tips && topic.tips.length > 0 && (
                  <div className="mrz-help-tips">
                    {topic.tips.map((tip) => <span key={tip}>{tip}</span>)}
                  </div>
                )}
                {topic.href && topic.cta && (
                  <Link href={topic.href} onClick={() => setOpen(false)}>
                    {topic.cta} <ArrowRight className="size-4" />
                  </Link>
                )}
              </article>
            )}
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <div className="mrz-bot-zone" ref={zoneRef}>
      {panel}

      {/* Botón del bot — se mueve suavemente en el footer */}
      <button
        className={`mrz-bot-btn ${open ? "active" : ""}`}
        onClick={() => setOpen((v) => !v)}
        type="button"
        aria-label="Abrir ayuda Maylo"
        style={{
          transform: `translateX(${botX}px)`,
          transition: open ? "none" : "transform 3.2s cubic-bezier(0.45,0.05,0.25,1)",
        }}
      >
        <BotRobot />
      </button>
    </div>
  );
}
