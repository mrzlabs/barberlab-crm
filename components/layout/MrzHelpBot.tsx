"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";

// ── Robot violeta oscuro — estilo referencia ──────────────────
const BotRobot = () => (
  <svg viewBox="0 0 80 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="bot-robot-svg">
    {/* antena */}
    <line x1="44" y1="2" x2="40" y2="14" stroke="#3d2f7a" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="46" cy="1" r="4" fill="#4fc3f7" stroke="#2a1f5e" strokeWidth="1.2"/>
    {/* cabeza */}
    <rect x="18" y="13" width="40" height="32" rx="8" fill="#4c3a91" stroke="#2a1f5e" strokeWidth="1.5"/>
    {/* brillo cabeza */}
    <rect x="22" y="15" width="18" height="8" rx="4" fill="rgba(255,255,255,0.12)"/>
    {/* ojos */}
    <circle cx="31" cy="29" r="7" fill="#f5c518"/>
    <circle cx="49" cy="29" r="7" fill="#f5c518"/>
    <circle cx="31" cy="29" r="4" fill="#1a1230"/>
    <circle cx="49" cy="29" r="4" fill="#1a1230"/>
    <circle cx="33" cy="27" r="1.5" fill="white" opacity="0.9"/>
    <circle cx="51" cy="27" r="1.5" fill="white" opacity="0.9"/>
    {/* cuello */}
    <rect x="32" y="45" width="16" height="7" rx="3" fill="#3d2f7a" stroke="#2a1f5e" strokeWidth="1.2"/>
    {/* cuerpo */}
    <rect x="14" y="52" width="40" height="32" rx="8" fill="#4c3a91" stroke="#2a1f5e" strokeWidth="1.5"/>
    {/* panel pecho */}
    <rect x="24" y="59" width="20" height="14" rx="4" fill="#3d2f7a" stroke="#2a1f5e" strokeWidth="1"/>
    <circle cx="31" cy="65" r="3" fill="#4fc3f7" opacity="0.85"/>
    <rect x="36" y="63" width="5" height="5" rx="1.5" fill="#f5c518" opacity="0.7"/>
    {/* brillo cuerpo */}
    <rect x="17" y="54" width="15" height="7" rx="3.5" fill="rgba(255,255,255,0.1)"/>
    {/* brazo izquierdo — bajado */}
    <rect x="2" y="54" width="13" height="8" rx="4" fill="#4c3a91" stroke="#2a1f5e" strokeWidth="1.5" transform="rotate(10 2 54)"/>
    <circle cx="4" cy="67" r="4" fill="#3d2f7a" stroke="#2a1f5e" strokeWidth="1.2"/>
    {/* brazo derecho — levantado saludando */}
    <rect x="63" y="42" width="13" height="8" rx="4" fill="#4c3a91" stroke="#2a1f5e" strokeWidth="1.5" transform="rotate(-35 63 46)"/>
    {/* mano/pinza */}
    <circle cx="74" cy="35" r="5" fill="#3d2f7a" stroke="#2a1f5e" strokeWidth="1.2"/>
    <line x1="74" y1="29" x2="71" y2="24" stroke="#3d2f7a" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="74" y1="29" x2="77" y2="24" stroke="#3d2f7a" strokeWidth="2.5" strokeLinecap="round"/>
    {/* líneas de saludo */}
    <line x1="79" y1="22" x2="81" y2="18" stroke="#4fc3f7" strokeWidth="1.8" strokeLinecap="round" opacity="0.7"/>
    <line x1="76" y1="20" x2="75" y2="15" stroke="#4fc3f7" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    {/* piernas */}
    <rect x="22" y="84" width="12" height="10" rx="4" fill="#3d2f7a" stroke="#2a1f5e" strokeWidth="1.2"/>
    <rect x="38" y="84" width="12" height="10" rx="4" fill="#3d2f7a" stroke="#2a1f5e" strokeWidth="1.2"/>
    {/* pies */}
    <rect x="19" y="91" width="18" height="5" rx="3" fill="#2a1f5e"/>
    <rect x="35" y="91" width="18" height="5" rx="3" fill="#2a1f5e"/>
  </svg>
);

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
  const hopTimeoutRef = useRef<number>();

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

  useEffect(() => { setActive(0); }, [query]);

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
        <BotRobot />
      </button>
    </>
  );
}
