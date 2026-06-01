"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Plus, Pencil } from "lucide-react";

const input = "w-full rounded-xl border bg-white/10 border-white/15 text-white placeholder:text-slate-500 px-3 py-2 text-sm outline-none focus:border-cyan-400";
const lbl   = "text-xs font-bold uppercase tracking-widest text-slate-400 mb-1";

type Item = { id: string; nombre: string; categoria: string; duracionMin: number; precio: string; costoInsumo: string; activo: boolean };

function ServicioForm({ action, item, onDone }: { action: (fd: FormData) => Promise<void>; item?: Item; onDone: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState("");

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try { await action(fd); router.refresh(); onDone(); }
      catch (ex) { setErr((ex as Error).message ?? "Error al guardar"); }
    });
  }

  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
      {item && <input type="hidden" name="servicioId" value={item.id} />}
      <label className={`${lbl} sm:col-span-2`}>
        Nombre<input className={input} name="nombre" defaultValue={item?.nombre} required />
      </label>
      <label className={lbl}>
        Categoría
        <select className={input} name="categoria" defaultValue={item?.categoria ?? "barberia"}>
          <option value="barberia">Barbería</option>
          <option value="peluqueria">Peluquería</option>
          <option value="spa_unas">Spa de uñas</option>
          <option value="tatuajes">Tatuajes</option>
        </select>
      </label>
      <label className={lbl}>Duración (min)<input className={input} name="duracionMin" type="number" defaultValue={item?.duracionMin ?? 45} required /></label>
      <label className={lbl}>Precio<input className={input} name="precio" type="number" defaultValue={item?.precio ?? ""} required /></label>
      <label className={lbl}>Costo insumo<input className={input} name="costoInsumo" type="number" defaultValue={item?.costoInsumo ?? "0"} /></label>
      <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2">
        <input name="activo" type="checkbox" defaultChecked={item?.activo ?? true} /> Activo
      </label>
      {err && <p className="rounded-xl bg-red-500/20 px-3 py-2 text-xs font-bold text-red-300 sm:col-span-2">{err}</p>}
      <button className="rounded-xl bg-slate-950 py-3 text-sm font-black text-white disabled:opacity-50 sm:col-span-2" type="submit" disabled={pending}>
        {pending ? "Guardando…" : item ? "Guardar cambios" : "Crear servicio"}
      </button>
    </form>
  );
}

export function ServicioCreateButton({ createAction }: { createAction: (fd: FormData) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-black text-white hover:bg-slate-800 transition" onClick={() => setOpen(true)} type="button">
        <Plus className="size-4" /> Nuevo servicio
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Nuevo servicio">
        <ServicioForm action={createAction} onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}

export function ServicioEditButton({ item, updateAction }: { item: Item; updateAction: (fd: FormData) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="inline-flex items-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-500/20 px-3 py-1.5 text-xs font-bold text-violet-300 hover:bg-violet-500/30 transition" onClick={() => setOpen(true)} type="button">
        <Pencil className="size-3" /> Editar
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={`Editar: ${item.nombre}`}>
        <ServicioForm action={updateAction} item={item} onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}
