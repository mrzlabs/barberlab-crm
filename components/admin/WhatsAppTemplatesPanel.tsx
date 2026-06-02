"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { updateWhatsAppConfig } from "@/app/admin/configuracion/actions";

const VARS = ["{nombre_cliente}", "{nombre_negocio}", "{servicio}", "{empleado}", "{fecha}", "{hora}", "{link_reserva}"];

const DEFAULTS = {
  confirmacion: "Hola {nombre_cliente}, tu cita en {nombre_negocio} para {servicio} con {empleado} está confirmada para el {fecha} a las {hora}. ¡Te esperamos!",
  recordatorio: "Hola {nombre_cliente}, te recordamos tu cita en {nombre_negocio} en 1 hora ({hora}). Si necesitas cancelar escríbenos.",
  seguimiento: "Gracias por visitarnos {nombre_cliente}. Esperamos verte pronto en {nombre_negocio}. Reserva tu próxima cita aquí: {link_reserva}",
};

type Templates = { confirmacion: string; recordatorio: string; seguimiento: string };

const MAX = 500;

function TemplateField({
  id, label, description, value, onChange,
}: {
  id: keyof Templates; label: string; description: string; value: string; onChange: (v: string) => void;
}) {
  function insertVar(varName: string) {
    const ta = document.getElementById(`tpl-${id}`) as HTMLTextAreaElement | null;
    if (!ta) return;
    const start = ta.selectionStart ?? value.length;
    const end = ta.selectionEnd ?? value.length;
    const next = value.slice(0, start) + varName + value.slice(end);
    if (next.length <= MAX) onChange(next);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + varName.length, start + varName.length);
    }, 0);
  }

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-300">{label}</p>
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        </div>
        <span className={`text-[10px] font-medium tabular-nums ${value.length > MAX * 0.9 ? "text-amber-400" : "text-slate-500"}`}>
          {value.length}/{MAX}
        </span>
      </div>
      <textarea
        id={`tpl-${id}`}
        className="w-full resize-none rounded-lg border border-slate-600/50 bg-slate-900/60 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
        rows={3}
        maxLength={MAX}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="mt-2 flex flex-wrap gap-1.5">
        {VARS.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => insertVar(v)}
            className="wa-var-chip rounded-full border px-2 py-0.5 text-[10px] font-bold transition"
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

export function WhatsAppTemplatesPanel({
  initialPhone,
  initialEnabled,
  initialTemplates,
  negocioId,
}: {
  initialPhone: string;
  initialEnabled: boolean;
  initialTemplates: Templates;
  negocioId: string;
}) {
  const [phone, setPhone] = useState(initialPhone);
  const [enabled, setEnabled] = useState(initialEnabled);
  const [templates, setTemplates] = useState<Templates>(initialTemplates);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    fd.set("negocioId", negocioId);
    fd.set("whatsappPhone", phone);
    fd.set("whatsappEnabled", enabled ? "true" : "false");
    fd.set("whatsappTemplates", JSON.stringify(templates));
    await updateWhatsAppConfig(fd);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <section id="whatsapp" className="rounded-xl border border-slate-700/50 bg-slate-900/80 p-5 shadow-lg">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-lg bg-emerald-500/15 text-emerald-400">
          <MessageSquare className="size-4.5" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-white">Notificaciones WhatsApp</h3>
          <p className="text-xs text-slate-400">Plantillas de mensajes automáticos para confirmaciones y recordatorios.</p>
        </div>
        <label className="ml-auto flex cursor-pointer items-center gap-2">
          <span className="text-xs text-slate-400">{enabled ? "Activo" : "Inactivo"}</span>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled((v) => !v)}
            className={`relative h-5 w-9 rounded-full transition-colors ${enabled ? "bg-emerald-500" : "bg-slate-600"}`}
          >
            <span className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-4" : "translate-x-0"}`} />
          </button>
        </label>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <input type="hidden" name="negocioId" value={negocioId} />

        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-400">
            Número WhatsApp del negocio
          </label>
          <input
            className="w-full rounded-lg border border-slate-600/50 bg-slate-800/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
            type="tel"
            placeholder="+57 300 000 0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <TemplateField
          id="confirmacion"
          label="1. Confirmación de cita"
          description="Se envía automáticamente al reservar."
          value={templates.confirmacion}
          onChange={(v) => setTemplates((t) => ({ ...t, confirmacion: v }))}
        />
        <TemplateField
          id="recordatorio"
          label="2. Recordatorio 1h antes"
          description="Enviado 1 hora antes del horario de la cita."
          value={templates.recordatorio}
          onChange={(v) => setTemplates((t) => ({ ...t, recordatorio: v }))}
        />
        <TemplateField
          id="seguimiento"
          label="3. Seguimiento post-servicio"
          description="Se envía después de marcar la cita como realizada."
          value={templates.seguimiento}
          onChange={(v) => setTemplates((t) => ({ ...t, seguimiento: v }))}
        />

        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={() => setTemplates({ ...DEFAULTS })}
            className="rounded-lg bg-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-600 hover:text-white"
          >
            Restaurar por defecto
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-cyan-400 disabled:opacity-60"
          >
            {saving ? "Guardando…" : saved ? "✓ Guardado" : "Guardar"}
          </button>
        </div>
      </form>
    </section>
  );
}
