"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";

// ── 5 robots SVG — estilo cartoon blanco/cyan ─────────────
const ROBOTS = [
  // 1 — Clásico cuadrado con antena
  <svg key="r1" viewBox="0 0 54 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="27" y1="1" x2="27" y2="9" stroke="#334155" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="27" cy="1" r="2.8" fill="#00cec9"/>
    <rect x="11" y="9" width="32" height="23" rx="5" fill="white" stroke="#334155" strokeWidth="1.8"/>
    <rect x="16" y="16" width="9" height="7" rx="2.5" fill="#00cec9"/>
    <rect x="29" y="16" width="9" height="7" rx="2.5" fill="#00cec9"/>
    <rect x="22" y="16" width="2.5" height="2.5" rx="1.2" fill="white" opacity="0.8"/>
    <rect x="35" y="16" width="2.5" height="2.5" rx="1.2" fill="white" opacity="0.8"/>
    <path d="M19 28 Q27 33 35 28" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    <rect x="14" y="34" width="26" height="18" rx="5" fill="white" stroke="#334155" strokeWidth="1.8"/>
    <rect x="21" y="38" width="12" height="8" rx="2" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1"/>
    <circle cx="24.5" cy="42" r="2" fill="#00cec9"/>
    <circle cx="29.5" cy="42" r="2" fill="#00cec9"/>
    <rect x="15" y="52" width="10" height="10" rx="4" fill="#334155"/>
    <rect x="29" y="52" width="10" height="10" rx="4" fill="#334155"/>
  </svg>,

  // 2 — Casco redondo estilo astronauta
  <svg key="r2" viewBox="0 0 54 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="27" cy="22" r="21" fill="white" stroke="#334155" strokeWidth="1.8"/>
    <ellipse cx="27" cy="23" rx="15" ry="13" fill="#f1f5f9"/>
    <circle cx="20" cy="21" r="6" fill="#00cec9"/>
    <circle cx="34" cy="21" r="6" fill="#00cec9"/>
    <circle cx="21.5" cy="19" r="2" fill="white"/>
    <circle cx="35.5" cy="19" r="2" fill="white"/>
    <path d="M20 32 Q27 37 34 32" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    <rect x="22" y="42" width="10" height="5" rx="2.5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1"/>
    <ellipse cx="27" cy="55" rx="14" ry="8" fill="white" stroke="#334155" strokeWidth="1.8"/>
    <ellipse cx="27" cy="55" rx="6" ry="3" fill="#e2e8f0"/>
  </svg>,

  // 3 — Doble antena estilo alien cute
  <svg key="r3" viewBox="0 0 54 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="18" y1="3" x2="22" y2="11" stroke="#334155" strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="36" y1="3" x2="32" y2="11" stroke="#334155" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="18" cy="2.5" r="3" fill="#00cec9"/>
    <circle cx="36" cy="2.5" r="3" fill="#00cec9"/>
    <ellipse cx="27" cy="22" rx="16" ry="13" fill="white" stroke="#334155" strokeWidth="1.8"/>
    <circle cx="20.5" cy="21" r="5.5" fill="#00cec9"/>
    <circle cx="33.5" cy="21" r="5.5" fill="#00cec9"/>
    <circle cx="22" cy="19" r="1.8" fill="white"/>
    <circle cx="35" cy="19" r="1.8" fill="white"/>
    <path d="M20 30 Q27 35 34 30" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    <rect x="13" y="38" width="28" height="19" rx="7" fill="white" stroke="#334155" strokeWidth="1.8"/>
    <rect x="5" y="40" width="9" height="6" rx="3" fill="white" stroke="#334155" strokeWidth="1.8"/>
    <rect x="40" y="40" width="9" height="6" rx="3" fill="white" stroke="#334155" strokeWidth="1.8"/>
    <rect x="17" y="57" width="8" height="7" rx="3" fill="#334155"/>
    <rect x="29" y="57" width="8" height="7" rx="3" fill="#334155"/>
  </svg>,

  // 4 — Robot con ruedas
  <svg key="r4" viewBox="0 0 54 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="27" y1="1" x2="27" y2="9" stroke="#334155" strokeWidth="1.8" strokeLinecap="round"/>
    <rect x="23" y="0" width="8" height="5" rx="2.5" fill="#00cec9" stroke="#334155" strokeWidth="1"/>
    <ellipse cx="27" cy="20" rx="17" ry="14" fill="white" stroke="#334155" strokeWidth="1.8"/>
    <circle cx="20" cy="19" r="6" fill="#00cec9"/>
    <circle cx="34" cy="19" r="6" fill="#00cec9"/>
    <circle cx="21.5" cy="17" r="2" fill="white"/>
    <circle cx="35.5" cy="17" r="2" fill="white"/>
    <path d="M19 29 Q27 34 35 29" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    <rect x="13" y="36" width="28" height="14" rx="5" fill="white" stroke="#334155" strokeWidth="1.8"/>
    <circle cx="14" cy="56" r="8" fill="white" stroke="#334155" strokeWidth="2"/>
    <circle cx="40" cy="56" r="8" fill="white" stroke="#334155" strokeWidth="2"/>
    <circle cx="14" cy="56" r="3.5" fill="#334155"/>
    <circle cx="40" cy="56" r="3.5" fill="#334155"/>
    <circle cx="14" cy="56" r="1.5" fill="#00cec9"/>
    <circle cx="40" cy="56" r="1.5" fill="#00cec9"/>
  </svg>,

  // 5 — Regordete simpático
  <svg key="r5" viewBox="0 0 54 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="27" y1="1" x2="27" y2="8" stroke="#334155" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="27" cy="1" r="3" fill="#00cec9"/>
    <rect x="23" y="8" width="8" height="5" rx="2" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1"/>
    <ellipse cx="27" cy="37" rx="22" ry="24" fill="white" stroke="#334155" strokeWidth="1.8"/>
    <circle cx="19.5" cy="30" r="6.5" fill="#00cec9"/>
    <circle cx="34.5" cy="30" r="6.5" fill="#00cec9"/>
    <circle cx="21" cy="27.5" r="2" fill="white"/>
    <circle cx="36" cy="27.5" r="2" fill="white"/>
    <path d="M18 43 Q27 51 36 43" stroke="#334155" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <ellipse cx="6" cy="37" rx="6" ry="4" fill="white" stroke="#334155" strokeWidth="1.5" transform="rotate(-15 6 37)"/>
    <ellipse cx="48" cy="37" rx="6" ry="4" fill="white" stroke="#334155" strokeWidth="1.5" transform="rotate(15 48 37)"/>
  </svg>,
];

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
  const [pos, setPos] = useState({ x: "8vw", y: "0px" });
  const [hop, setHop] = useState(false);
  const [botIdx, setBotIdx] = useState(0);
  const [botFade, setBotFade] = useState(true);
  const hopTimeoutRef = useRef<number>();

  // Movimiento del bot
  useEffect(() => {
    if (open) return;
    const targets = [
      { x: "4vw", y: "0px" },
      { x: "22vw", y: "-28px" },
      { x: "44vw", y: "-8px" },
      { x: "63vw", y: "-32px" },
      { x: "82vw", y: "-10px" },
    ];
    let index = 0;
    const id = window.setInterval(() => {
      index = (index + 1) % targets.length;
      setPos(targets[index]);
      setHop(true);
      hopTimeoutRef.current = window.setTimeout(() => setHop(false), 430);
    }, 5200);
    return () => {
      window.clearInterval(id);
      if (hopTimeoutRef.current) window.clearTimeout(hopTimeoutRef.current);
    };
  }, [open]);

  // Ciclo de robots — cambia con fade
  useEffect(() => {
    const id = window.setInterval(() => {
      setBotFade(false);
      window.setTimeout(() => {
        setBotIdx((i) => (i + 1) % ROBOTS.length);
        setBotFade(true);
      }, 200);
    }, 3800);
    return () => window.clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return topics;
    return topics.filter((topic) => [
      topic.title,
      topic.body,
      ...topic.steps,
      ...(topic.tips ?? []),
    ].join(" ").toLowerCase().includes(term));
  }, [query, topics]);

  const topic = filtered[active] ?? filtered[0] ?? topics[0];

  useEffect(() => {
    setActive(0);
  }, [query]);

  return (
    <>
      {open && (
        <div className="mrz-help-panel">
          <div className="mrz-help-head">
            <div>
              <p>Bot MRZLABS</p>
              <h3>Guía operativa del CRM</h3>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar ayuda"><X className="size-4" /></button>
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
      <button
        className={`mrz-bot fixed ${hop ? "hop" : ""}`}
        style={{ ["--bx" as string]: pos.x, ["--by" as string]: pos.y }}
        onClick={() => setOpen((v) => !v)}
        type="button"
        aria-label="Abrir ayuda BarberLab"
      >
        <span
          className="bot-robot-wrap"
          style={{ opacity: botFade ? 1 : 0, transition: "opacity 0.2s ease" }}
        >
          {ROBOTS[botIdx]}
        </span>
      </button>
    </>
  );
}
