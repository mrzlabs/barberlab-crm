"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Plus, Pencil } from "lucide-react";

const input = "w-full rounded-xl border bg-white/10 border-white/15 text-white placeholder:text-slate-500 px-3 py-2 text-sm outline-none focus:border-cyan-400";
const lbl   = "text-xs font-bold uppercase tracking-widest text-slate-400 mb-1";

type Item = { id: string; nombre: string; telefono: string; email: string | null; notas: string | null };

function ClienteForm({ action, item, onDone }: { action: (fd: FormData) => Promise<void>; item?: Item; onDone: () => void }) {
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
    <form className="grid gap-4" onSubmit={submit}>
      {item && <input type="hidden" name="clienteId" value={item.id} />}
      <label className={lbl}>Nombre<input className={input} name="nombre" defaultValue={item?.nombre} required /></label>
      <label className={lbl}>Teléfono<input className={input} name="telefono" defaultValue={item?.telefono} required /></label>
      <label className={lbl}>Email<input className={input} name="email" type="email" defaultValue={item?.email ?? ""} /></label>
      {!item && (
        <>
          <label className={lbl}>Password (si crea cuenta)<input className={input} name="password" type="password" minLength={8} /></label>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input name="crearCuenta" type="checkbox" /> Crear acceso cliente
          </label>
        </>
      )}
      <label className={lbl}>Notas<textarea className={input} name="notas" rows={3} defaultValue={item?.notas ?? ""} /></label>
      {err && <p className="rounded-xl bg-red-500/20 px-3 py-2 text-xs font-bold text-red-300">{err}</p>}
      <button className="rounded-xl bg-slate-950 py-3 text-sm font-black text-white disabled:opacity-50" type="submit" disabled={pending}>
        {pending ? "Guardando…" : item ? "Guardar cambios" : "Crear cliente"}
      </button>
    </form>
  );
}

export function ClienteCreateButton({ createAction }: { createAction: (fd: FormData) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-black text-white hover:bg-slate-800 transition" onClick={() => setOpen(true)} type="button">
        <Plus className="size-4" /> Nuevo cliente
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Nuevo cliente">
        <ClienteForm action={createAction} onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}

export function ClienteEditButton({ item, updateAction }: { item: Item; updateAction: (fd: FormData) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-cyan-500 transition" onClick={() => setOpen(true)} type="button">
        <Pencil className="size-3" /> Editar
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={`Editar: ${item.nombre}`}>
        <ClienteForm action={updateAction} item={item} onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}
