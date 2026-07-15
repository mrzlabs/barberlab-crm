"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Plus, Pencil } from "lucide-react";

const input = "w-full rounded-xl border bg-white/10 border-white/15 text-white placeholder:text-slate-500 px-3 py-2 text-sm outline-none focus:border-cyan-400";
const lbl   = "text-xs font-bold uppercase tracking-widest text-slate-400 mb-1";

type Item = {
  id: string; usuarioId: string; nombre: string; telefono: string | null;
  especialidad: string; comisionPct: string; activo: boolean;
};

type FormProps = {
  action: (fd: FormData) => Promise<void>;
  item?: Item;
  onDone: () => void;
};

function EmpleadoForm({ action, item, onDone }: FormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState("");

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await action(fd);
        router.refresh();
        onDone();
      } catch (ex) {
        setErr((ex as Error).message ?? "Error al guardar");
      }
    });
  }

  return (
    <form className="grid gap-4" onSubmit={submit}>
      {item && (
        <>
          <input type="hidden" name="empleadoId" value={item.id} />
          <input type="hidden" name="usuarioId" value={item.usuarioId} />
        </>
      )}
      <label className={lbl}>Nombre<input className={input} name="nombre" defaultValue={item?.nombre} required /></label>
      {!item && (
        <>
          <label className={lbl}>Email<input className={input} name="email" type="email" required /></label>
          <label className={lbl}>Password inicial<input className={input} name="password" type="password" minLength={8} placeholder="Mínimo 8 caracteres" required /></label>
        </>
      )}
      <label className={lbl}>Teléfono<input className={input} name="telefono" defaultValue={item?.telefono ?? ""} required /></label>
      <label className={lbl}>
        Especialidad
        <select className={input} name="especialidad" defaultValue={item?.especialidad ?? "barberia"}>
          <option value="barberia">Barbería</option>
          <option value="peluqueria">Peluquería</option>
          <option value="spa_unas">Spa de uñas</option>
          <option value="tatuajes">Tatuajes</option>
        </select>
      </label>
      <label className={lbl}>Comisión %<input className={input} name="comisionPct" type="number" min="0" max="100" defaultValue={item?.comisionPct ?? "40"} /></label>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input name="activo" type="checkbox" defaultChecked={item?.activo ?? true} /> Activo
      </label>
      {err && <p className="rounded-xl bg-red-500/20 px-3 py-2 text-xs font-bold text-red-300">{err}</p>}
      <div className="flex gap-3 pt-1">
        <button
          className="flex-1 rounded-xl bg-slate-950 py-3 text-sm font-black text-auto disabled:opacity-50"
          type="submit"
          disabled={pending}
        >
          {pending ? "Guardando…" : item ? "Guardar cambios" : "Crear empleado"}
        </button>
      </div>
    </form>
  );
}

export function EmpleadoCreateButton({ createAction }: { createAction: (fd: FormData) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-black text-auto hover:bg-slate-800 transition"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Plus className="size-4" /> Nuevo empleado
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Nuevo empleado">
        <EmpleadoForm action={createAction} onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}

export function EmpleadoEditButton({ item, updateAction }: { item: Item; updateAction: (fd: FormData) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="inline-flex items-center gap-1.5 rounded-control border border-ds-border px-2.5 py-1 text-[12px] font-medium text-ds-fg-muted transition-colors hover:border-ds-border-strong hover:text-ds-fg"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Pencil className="size-3" /> Editar
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={`Editar: ${item.nombre}`}>
        <EmpleadoForm action={updateAction} item={item} onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}
