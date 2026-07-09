import { Award, Globe, QrCode, ShieldCheck } from "lucide-react";
import { updateClientesFidelizacion } from "@/app/admin/configuracion/actions";
import { getPuntosConfig } from "@/lib/puntos";
import { getVertical, VERTICALES } from "@/lib/verticales";
import type { NegocioSettings } from "@/lib/db/schema";
import { SubmitButton } from "@/components/layout/SubmitButton";

const input = "w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500";

export function ClientesFidelizacionPanel({
  slug,
  settings,
  appUrl,
}: {
  slug: string;
  settings: NegocioSettings | null | undefined;
  appUrl: string;
}) {
  const puntos = getPuntosConfig(settings);
  const vertical = getVertical(settings);
  const politicas = settings?.politicas ?? {};
  const registroUrl = `${appUrl}/r/${slug}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(registroUrl)}`;

  return (
    <div className="glass-panel mt-6 rounded-[1.5rem] p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-400">Clientes y fidelización</p>
      <p className="mt-1 text-sm crm-text-muted">
        Tipo de negocio, sistema de puntos, políticas de manejo de clientes y registro público.
      </p>

      <form action={updateClientesFidelizacion} className="mt-5 grid gap-4">
        {/* Vertical del negocio */}
        <div className="rounded-2xl border border-white/10 bg-white/6 px-5 py-4">
          <label className="grid gap-2 text-sm font-bold text-auto">
            Tipo de negocio (vertical)
            <select name="vertical" defaultValue={vertical.id} className={input}>
              {VERTICALES.map((v) => (
                <option key={v.id} value={v.id}>{v.label} — {v.descripcion}</option>
              ))}
            </select>
          </label>
          <p className="mt-2 text-xs crm-text-muted">
            El mismo sistema se adapta al vocabulario de tu vertical: en «{vertical.label}» tus {vertical.vocab.citas.toLowerCase()} atienden {vertical.vocab.clientes.toLowerCase()}. Elige «Restaurante / Bar» si montas uno.
          </p>
        </div>

        {/* Sistema de puntos */}
        <div className="rounded-2xl border border-white/10 bg-white/6 px-5 py-4">
          <div className="flex items-center gap-2">
            <Award className="size-4 text-amber-400" />
            <p className="text-sm font-bold text-auto">Sistema de puntos</p>
          </div>
          <label className="mt-3 flex items-center gap-3 text-sm text-auto">
            <input type="checkbox" name="puntosHabilitado" defaultChecked={puntos.habilitado} className="size-4 accent-violet-500" />
            Acumular puntos automáticamente al cerrar cada turno
          </label>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <label className="grid gap-1.5 text-xs font-bold crm-text-secondary">
              $ por punto
              <input className={input} name="pesosPorPunto" type="number" min={100} step={100} defaultValue={puntos.pesosPorPunto} />
              <span className="font-normal crm-text-muted">1 punto por cada ${puntos.pesosPorPunto.toLocaleString("es-CO")} de consumo</span>
            </label>
            <label className="grid gap-1.5 text-xs font-bold crm-text-secondary">
              Valor del punto ($)
              <input className={input} name="valorPunto" type="number" min={1} step={5} defaultValue={puntos.valorPunto} />
              <span className="font-normal crm-text-muted">al canjear en servicios</span>
            </label>
            <label className="grid gap-1.5 text-xs font-bold crm-text-secondary">
              Mínimo para canje
              <input className={input} name="minCanje" type="number" min={1} defaultValue={puntos.minCanje} />
              <span className="font-normal crm-text-muted">puntos acumulados</span>
            </label>
            <label className="grid gap-1.5 text-xs font-bold crm-text-secondary">
              Bono de registro
              <input className={input} name="bonoRegistro" type="number" min={0} defaultValue={puntos.bonoRegistro} />
              <span className="font-normal crm-text-muted">puntos de bienvenida</span>
            </label>
          </div>
        </div>

        {/* Políticas de manejo de clientes */}
        <div className="rounded-2xl border border-white/10 bg-white/6 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-400" />
            <p className="text-sm font-bold text-auto">Políticas de manejo de clientes</p>
          </div>
          <label className="mt-3 flex items-center gap-3 text-sm text-auto">
            <input type="checkbox" name="consentimientoObligatorio" defaultChecked={politicas.consentimientoObligatorio ?? true} className="size-4 accent-violet-500" />
            Exigir consentimiento de tratamiento de datos al registrarse
          </label>
          <label className="mt-3 grid gap-2 text-xs font-bold crm-text-secondary">
            Texto de política mostrado en el registro público
            <textarea
              className={`${input} min-h-24`}
              name="textoRegistro"
              maxLength={1200}
              defaultValue={politicas.textoRegistro || "Autorizo el tratamiento de mis datos personales para agendar citas, recibir recordatorios y beneficios del programa de puntos, conforme a la Ley 1581 de 2012."}
            />
          </label>
        </div>

        <SubmitButton label="Guardar clientes y fidelización" />
      </form>

      {/* Registro público */}
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/6 px-5 py-4">
        <div className="flex items-center gap-2">
          <Globe className="size-4 text-cyan-400" />
          <p className="text-sm font-bold text-auto">Registro público de clientes</p>
        </div>
        <p className="mt-1 text-xs crm-text-muted">
          Comparte este enlace o el QR: tus {vertical.vocab.clientes.toLowerCase()} se registran solos
          {puntos.bonoRegistro > 0 ? ` y reciben ${puntos.bonoRegistro} puntos de bienvenida` : ""}. Cada registro llega a tu módulo de Clientes.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrUrl} alt="QR de registro público" width={140} height={140} className="rounded-xl bg-white p-2" />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest crm-text-muted"><QrCode className="size-3.5" /> Enlace</p>
            <a href={registroUrl} target="_blank" rel="noreferrer" className="mt-1 block break-all font-mono text-sm text-cyan-300 underline-offset-2 hover:underline">
              {registroUrl}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
