"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";

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
        <span />
        <i />
      </button>
    </>
  );
}
