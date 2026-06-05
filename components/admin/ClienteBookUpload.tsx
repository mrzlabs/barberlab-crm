"use client";

import { useRef, useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { addClienteArchivo } from "@/app/admin/clientes/[id]/actions";

type Tipo = "boceto" | "referencia" | "resultado" | "otro";

const TIPO_OPTS: { value: Tipo; label: string; color: string }[] = [
  { value: "boceto",     label: "Boceto",     color: "#7F77DD" },
  { value: "referencia", label: "Referencia", color: "#F5C400" },
  { value: "resultado",  label: "Resultado",  color: "#27C3D8" },
  { value: "otro",       label: "Otro",       color: "#8a8a9c" },
];

interface Props {
  clienteId: string;
  negocioId: string;
  citaId?: string;
}

export function ClienteBookUpload({ clienteId, negocioId, citaId }: Props) {
  const fileRef   = useRef<HTMLInputElement>(null);
  const [tipo, setTipo]           = useState<Tipo>("boceto");
  const [nombre, setNombre]       = useState("");
  const [descripcion, setDesc]    = useState("");
  const [preview, setPreview]     = useState<string | null>(null);
  const [fileName, setFileName]   = useState<string | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [progress, setProgress]   = useState(0);
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);

  const busy = uploading || isPending;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validaciones cliente
    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten imágenes (JPG, PNG, WEBP, GIF).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("El archivo no puede superar 10 MB.");
      return;
    }

    setError(null);
    setFileName(file.name);
    if (!nombre) setNombre(file.name.replace(/\.[^.]+$/, ""));

    // Preview local
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) { setError("Selecciona una imagen primero."); return; }
    if (!nombre.trim()) { setError("Escribe un nombre para la imagen."); return; }

    setError(null);
    setUploading(true);
    setProgress(10);

    try {
      const supabase = createSupabaseBrowserClient();

      // Ruta: {negocio_id}/{cliente_id}/{timestamp}-{nombre-limpio}.ext
      const ext  = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const slug = nombre.trim().toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 40);
      const path = `${negocioId}/${clienteId}/${Date.now()}-${slug}.${ext}`;

      setProgress(30);

      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from("cliente-archivos")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw new Error(uploadError.message);
      setProgress(70);

      // URL pública firmada (1 año)
      const { data: urlData } = await supabase
        .storage
        .from("cliente-archivos")
        .createSignedUrl(uploadData.path, 60 * 60 * 24 * 365);

      if (!urlData?.signedUrl) throw new Error("No se pudo obtener la URL del archivo.");
      setProgress(85);

      // Guardar en DB via server action
      const fd = new FormData();
      fd.set("clienteId",   clienteId);
      fd.set("citaId",      citaId ?? "");
      fd.set("tipo",        tipo);
      fd.set("url",         urlData.signedUrl);
      fd.set("storagePath", uploadData.path);
      fd.set("nombre",      nombre.trim());
      fd.set("descripcion", descripcion.trim());

      startTransition(async () => {
        await addClienteArchivo(fd);
        setProgress(100);
        // Reset form
        setPreview(null);
        setFileName(null);
        setNombre("");
        setDesc("");
        setTipo("boceto");
        setProgress(0);
        if (fileRef.current) fileRef.current.value = "";
      });

    } catch (err: any) {
      setError(err.message ?? "Error al subir la imagen. Intenta de nuevo.");
      setProgress(0);
    } finally {
      setUploading(false);
    }
  }

  const inputCls = "w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Zona de drop / selector */}
      <div
        onClick={() => fileRef.current?.click()}
        className="relative cursor-pointer rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.03] p-6 text-center transition hover:border-[#7F77DD]/60 hover:bg-[#7F77DD]/5"
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={handleFileChange}
          disabled={busy}
        />

        {preview ? (
          <div className="flex flex-col items-center gap-3">
            <img
              src={preview}
              alt="preview"
              className="mx-auto h-36 w-36 rounded-xl object-cover border border-white/10"
            />
            <p className="text-xs font-semibold text-slate-300">{fileName}</p>
            <p className="text-[11px] text-slate-500">Click para cambiar imagen</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7F77DD]/20 text-3xl">
              🖼
            </div>
            <p className="text-sm font-semibold text-slate-300">
              Click para seleccionar imagen
            </p>
            <p className="text-[11px] text-slate-500">
              JPG, PNG, WEBP o GIF · máx 10 MB
            </p>
          </div>
        )}
      </div>

      {/* Campos */}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-bold uppercase text-slate-400">
          Nombre *
          <input
            className={`${inputCls} mt-1`}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Boceto manga dragón"
            required
            disabled={busy}
          />
        </label>

        <label className="text-xs font-bold uppercase text-slate-400">
          Tipo
          <div className="mt-1 flex gap-1.5 flex-wrap">
            {TIPO_OPTS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTipo(opt.value)}
                disabled={busy}
                style={tipo === opt.value
                  ? { background: opt.color + "25", color: opt.color, borderColor: opt.color + "60" }
                  : { background: "transparent", color: "#6a6a7c", borderColor: "#23232f" }
                }
                className="rounded-full border px-3 py-1 text-[11px] font-black transition"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </label>
      </div>

      <label className="block text-xs font-bold uppercase text-slate-400">
        Descripción (opcional)
        <input
          className={`${inputCls} mt-1`}
          value={descripcion}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Notas sobre el diseño o sesión"
          disabled={busy}
        />
      </label>

      {/* Barra de progreso */}
      {progress > 0 && progress < 100 && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[#7F77DD] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={busy || !preview}
        className="w-full rounded-xl px-4 py-3 text-sm font-black transition disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: "#7F77DD", color: "#fff" }}
      >
        {uploading
          ? `Subiendo… ${progress}%`
          : isPending
            ? "Guardando…"
            : "Subir al book"}
      </button>
    </form>
  );
}
