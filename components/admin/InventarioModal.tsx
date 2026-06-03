"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Plus, Pencil } from "lucide-react";

const input = "w-full rounded-xl border bg-white/10 border-white/15 text-white placeholder:text-slate-500 px-3 py-2 text-sm outline-none focus:border-cyan-400";
const lbl   = "text-xs font-bold uppercase tracking-widest text-slate-400 mb-1";

type Item = { id: string; nombre: string; sku: string; categoria: string; unidad: string; stock: string; stockMinimo: string; costoUnitario: string; precioVenta: string; descripcion?: string | null; fotoUrl?: string | null; activo: boolean; visibleCliente: boolean };

function InventarioForm({ action, item, onDone, categorias = [] }: { action: (fd: FormData) => Promise<void>; item?: Item; onDone: () => void; categorias?: string[] }) {
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
      {item && (
        <>
          <input type="hidden" name="inventarioId" value={item.id} />
          <input type="hidden" name="fotoUrl" value={item.fotoUrl ?? ""} />
        </>
      )}
      {!item && <label className={lbl}>SKU<input className={input} name="sku" required /></label>}
      <label className={`${lbl} ${!item ? "" : "sm:col-span-2"}`}>
        Nombre<input className={input} name="nombre" defaultValue={item?.nombre} required />
      </label>
      <label className={`${lbl} sm:col-span-2`}>
        Descripción<textarea className={input} name="descripcion" rows={2} defaultValue={item?.descripcion ?? ""} />
      </label>
      <label className={`${lbl} sm:col-span-2`}>
        Foto<input className={input} name="foto" type="file" accept="image/jpeg,image/png,image/webp,image/avif" />
      </label>
      <label className={lbl}>
        Categoría
        <input
          className={input}
          name="categoria"
          defaultValue={item?.categoria}
          list="cat-list"
          placeholder="Barbería, Cuidado, Styling…"
          required
        />
        {categorias.length > 0 && (
          <datalist id="cat-list">
            {categorias.map((c) => <option key={c} value={c} />)}
          </datalist>
        )}
      </label>
      <label className={lbl}>Unidad<input className={input} name="unidad" defaultValue={item?.unidad} placeholder="ml, unidad, caja" required /></label>
      {!item && <label className={lbl}>Stock inicial<input className={input} name="stock" type="number" min="0" defaultValue="0" /></label>}
      <label className={lbl}>Stock mínimo<input className={input} name="stockMinimo" type="number" min="0" defaultValue={item?.stockMinimo ?? "0"} /></label>
      <label className={lbl}>Costo unitario<input className={input} name="costoUnitario" type="number" min="0" defaultValue={item?.costoUnitario ?? "0"} /></label>
      <label className={lbl}>Precio venta<input className={input} name="precioVenta" type="number" min="0" defaultValue={item?.precioVenta ?? "0"} /></label>
      <div className="flex gap-4 sm:col-span-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <input name="activo" type="checkbox" defaultChecked={item?.activo ?? true} />
          <span className="text-slate-200">Activo</span>
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <input name="visibleCliente" type="checkbox" defaultChecked={item?.visibleCliente} />
          <span className="text-slate-200">Visible cliente</span>
        </label>
      </div>
      {err && <p className="rounded-xl bg-red-500/20 px-3 py-2 text-xs font-bold text-red-300 sm:col-span-2">{err}</p>}
      <button className="rounded-xl bg-slate-950 py-3 text-sm font-black text-auto disabled:opacity-50 sm:col-span-2" type="submit" disabled={pending}>
        {pending ? "Guardando…" : item ? "Guardar cambios" : "Crear item"}
      </button>
    </form>
  );
}

export function InventarioCreateButton({ createAction, categorias = [] }: { createAction: (fd: FormData) => Promise<void>; categorias?: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-black text-auto hover:bg-slate-800 transition" onClick={() => setOpen(true)} type="button">
        <Plus className="size-4" /> Nuevo item
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Nuevo item de inventario">
        <InventarioForm action={createAction} onDone={() => setOpen(false)} categorias={categorias} />
      </Modal>
    </>
  );
}

export function InventarioEditButton({ item, updateAction, categorias = [] }: { item: Item; updateAction: (fd: FormData) => Promise<void>; categorias?: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="inline-flex items-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-500/20 px-3 py-1.5 text-xs font-bold text-violet-300 hover:bg-violet-500/30 transition" onClick={() => setOpen(true)} type="button">
        <Pencil className="size-3" /> Editar
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={`Editar: ${item.nombre}`}>
        <InventarioForm action={updateAction} item={item} onDone={() => setOpen(false)} categorias={categorias} />
      </Modal>
    </>
  );
}
