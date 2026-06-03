"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Plus, Pencil } from "lucide-react";

const input = "w-full rounded-xl border bg-white/10 border-white/15 text-white placeholder:text-slate-500 px-3 py-2 text-sm outline-none focus:border-cyan-400";
const lbl   = "text-xs font-bold uppercase tracking-widest text-slate-400 mb-1";

type Item = { id: string; categoria: string; monto: string | number; fecha: string; descripcion?: string | null; comprobanteUrl?: string | null };

function GastoForm({ action, item, onDone }: { action: (fd: FormData) => Promise<void>; item?: Item; onDone: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try { await action(fd); router.refresh(); onDone(); }
      catch (ex) { setErr((ex as Error).message ?? "Error al guardar"); }
    });
  }

  return (
    <form className="grid gap-4" onSubmit={submit}>
      {item && <input type="hidden" name="gastoId" value={item.id} />}
      <label className={lbl}>
        Categoría
        <select className={input} name="categoria" defaultValue={item?.categoria ?? "otros"} required>
          <option value="arriendo">Arriendo</option>
          <option value="servicios_publicos">Servicios públicos</option>
          <option value="nomina">Nómina</option>
          <option value="insumos">Insumos</option>
          <option value="marketing">Marketing</option>
          <option value="otros">Otros</option>
        </select>
      </label>
      <label className={lbl}>Monto<input className={input} name="monto" type="number" min="0" defaultValue={item?.monto ?? ""} required /></label>
      <label className={lbl}>Fecha<input className={input} name="fecha" type="date" defaultValue={item?.fecha ?? today} required /></label>
      <label className={lbl}>Descripción<textarea className={input} name="descripcion" rows={3} defaultValue={item?.descripcion ?? ""} /></label>
      <label className={lbl}>Comprobante URL<input className={input} name="comprobanteUrl" type="url" defaultValue={item?.comprobanteUrl ?? ""} /></label>
      {err && <p className="rounded-xl bg-red-500/20 px-3 py-2 text-xs font-bold text-red-300">{err}</p>}
      <button className="rounded-xl bg-slate-950 py-3 text-sm font-black text-auto disabled:opacity-50" type="submit" disabled={pending}>
        {pending ? "Guardando…" : item ? "Guardar cambios" : "Registrar gasto"}
      </button>
    </form>
  );
}

export function GastoCreateButton({ createAction }: { createAction: (fd: FormData) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-black text-auto hover:bg-slate-800 transition" onClick={() => setOpen(true)} type="button">
        <Plus className="size-4" /> Nuevo gasto
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Registrar gasto">
        <GastoForm action={createAction} onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}

export function GastoEditButton({ item, updateAction }: { item: Item; updateAction: (fd: FormData) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="inline-flex items-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-500/20 px-3 py-1.5 text-xs font-bold text-violet-300 hover:bg-violet-500/30 transition" onClick={() => setOpen(true)} type="button">
        <Pencil className="size-3" /> Editar
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Editar gasto">
        <GastoForm action={updateAction} item={item} onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}
