"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";

// ── Robot violeta — proporciones corregidas ───────────────────
function BotRobot() {
  return (
    <svg viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="bot-robot-svg" aria-hidden="true">
      {/* antena */}
      <line x1="35" y1="3" x2="32" y2="10" stroke="#3d2f7a" strokeWidth="2.2" strokeLinecap="round"/>
      <circle cx="36.5" cy="2" r="3.5" fill="#4fc3f7" stroke="#2a1f5e" strokeWidth="1"/>
      {/* cabeza */}
      <rect x="14" y="9" width="36" height="26" rx="7" fill="#4c3a91" stroke="#2a1f5e" strokeWidth="1.5"/>
      <rect x="17" y="11" width="14" height="6" rx="3" fill="rgba(255,255,255,0.11)"/>
      {/* ojos */}
      <circle cx="26" cy="22" r="6" fill="#f5c518"/>
      <circle cx="42" cy="22" r="6" fill="#f5c518"/>
      <circle cx="26" cy="22" r="3.2" fill="#1a1230"/>
      <circle cx="42" cy="22" r="3.2" fill="#1a1230"/>
      <circle cx="27.4" cy="20.5" r="1.3" fill="white" opacity="0.9"/>
      <circle cx="43.4" cy="20.5" r="1.3" fill="white" opacity="0.9"/>
      {/* cuello */}
      <rect x="26" y="35" width="12" height="6" rx="3" fill="#3d2f7a" stroke="#2a1f5e" strokeWidth="1.2"/>
      {/* cuerpo */}
      <rect x="10" y="41" width="44" height="28" rx="7" fill="#4c3a91" stroke="#2a1f5e" strokeWidth="1.5"/>
      <rect x="13" y="43" width="13" height="6" rx="3" fill="rgba(255,255,255,0.10)"/>
      {/* panel pecho */}
      <rect x="19" y="49" width="24" height="14" rx="3.5" fill="#3d2f7a" stroke="#2a1f5e" strokeWidth="1"/>
      <circle cx="26" cy="56" r="2.8" fill="#4fc3f7" opacity="0.9"/>
      <circle cx="32" cy="56" r="2" fill="#f5c518" opacity="0.75"/>
      <rect x="36" y="53" width="4.5" height="4.5" rx="1.2" fill="#7c3aed" opacity="0.8"/>
      {/* brazo izquierdo — junto al cuerpo */}
      <rect x="1" y="46" width="10" height="7" rx="3.5" fill="#4c3a91" stroke="#2a1f5e" strokeWidth="1.3"/>
      <circle cx="5" cy="57" r="4" fill="#3d2f7a" stroke="#2a1f5e" strokeWidth="1.1"/>
      {/* brazo derecho — levantado, unido al hombro */}
      <path d="M54 50 C56 44 58 38 59 30" stroke="#4c3a91" strokeWidth="8" strokeLinecap="round"/>
      <path d="M54 50 C56 44 58 38 59 30" stroke="#2a1f5e" strokeWidth="9.5" strokeLinecap="round" opacity="0.5"/>
      <path d="M54 50 C56 44 58 38 59 30" stroke="#4c3a91" strokeWidth="8" strokeLinecap="round"/>
      {/* mano */}
      <circle cx="60" cy="27" r="4.5" fill="#3d2f7a" stroke="#2a1f5e" strokeWidth="1.2"/>
      <line x1="60" y1="22" x2="57" y2="16" stroke="#3d2f7a" strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="60" y1="22" x2="63" y2="16" stroke="#3d2f7a" strokeWidth="2.2" strokeLinecap="round"/>
      {/* líneas saludo */}
      <line x1="65" y1="14" x2="67" y2="10" stroke="#4fc3f7" strokeWidth="1.5" strokeLinecap="round" opacity="0.65"/>
      <line x1="62" y1="12" x2="61" y2="7" stroke="#4fc3f7" strokeWidth="1.3" strokeLinecap="round" opacity="0.45"/>
      {/* piernas */}
      <rect x="15" y="69" width="13" height="9" rx="4" fill="#3d2f7a" stroke="#2a1f5e" strokeWidth="1.2"/>
      <rect x="36" y="69" width="13" height="9" rx="4" fill="#3d2f7a" stroke="#2a1f5e" strokeWidth="1.2"/>
      {/* pies */}
      <rect x="12" y="75" width="19" height="5" rx="3" fill="#2a1f5e"/>
      <rect x="33" y="75" width="19" height="5" rx="3" fill="#2a1f5e"/>
    </svg>
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
  const panelRef = useRef<HTMLDivElement>(null);

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

  return (
    <div style={{ position: "relative" }}>
      {/* Panel de ayuda — se abre hacia arriba */}
      {open && (
        <div
          ref={panelRef}
          className="mrz-help-panel"
          style={{
            position: "fixed",
            right: 18,
            bottom: 80,
            zIndex: 200,
          }}
        >
          <div className="mrz-help-head">
            <div>
              <p>Bot MRZLABS</p>
              <h3>Guía operativa del CRM</h3>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar ayuda">
              <X className="size-4" />
            </button>
          </div>
          <label className="mrz-help-search">
            <Search className="size-4" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar módulo, paso o reporte" />
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
        </div>
      )}

      {/* Botón del bot */}
      <button
        className={`mrz-bot-btn ${open ? "active" : ""}`}
        onClick={() => setOpen((v) => !v)}
        type="button"
        aria-label="Abrir ayuda BarberLab"
      >
        <BotRobot />
      </button>
    </div>
  );
}
