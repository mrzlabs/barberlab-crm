"use client";

import { useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

interface Props {
  negocioId: string;
  /** nombre del input hidden que recibirá la URL — debe coincidir con el campo del form */
  inputName?: string;
  /** URL existente (modo edición) */
  defaultUrl?: string | null;
  bucket?: string;
  /** Sub-ruta dentro del bucket, ej: "gastos" */
  folder?: string;
}

export function ComprobanteUpload({
  negocioId,
  inputName = "comprobanteUrl",
  defaultUrl,
  bucket = "comprobantes",
  folder = "gastos",
}: Props) {
  const fileRef  = useRef<HTMLInputElement>(null);
  const [url, setUrl]         = useState<string>(defaultUrl ?? "");
  const [preview, setPreview] = useState<string | null>(defaultUrl ?? null);
  const [fileName, setFile]   = useState<string | null>(null);
  const [uploading, setUp]    = useState(false);
  const [progress, setProg]   = useState(0);
  const [error, setError]     = useState<string | null>(null);

  const isImage = (u: string) => /\.(jpg|jpeg|png|webp|gif)$/i.test(u);
  const isPdf   = (u: string) => /\.pdf$/i.test(u);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
    if (!allowed.includes(file.type)) {
      setError("Solo JPG, PNG, WEBP, GIF o PDF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Máx 10 MB.");
      return;
    }

    setError(null);
    setFile(file.name);

    // Preview local para imágenes
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null); // PDF — sin preview visual
    }

    setUp(true);
    setProg(20);

    try {
      const supabase = createSupabaseBrowserClient();
      const ext  = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${negocioId}/${folder}/${Date.now()}.${ext}`;

      setProg(40);
      const { data, error: upErr } = await supabase
        .storage
        .from(bucket)
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (upErr) throw new Error(upErr.message);
      setProg(80);

      const { data: urlData } = await supabase
        .storage
        .from(bucket)
        .createSignedUrl(data.path, 60 * 60 * 24 * 365);

      if (!urlData?.signedUrl) throw new Error("No se pudo obtener la URL.");
      setProg(100);
      setUrl(urlData.signedUrl);
    } catch (err: any) {
      setError(err.message ?? "Error al subir el archivo.");
      setProg(0);
    } finally {
      setUp(false);
    }
  }

  return (
    <div className="space-y-2">
      {/* Input hidden que el form envía */}
      <input type="hidden" name={inputName} value={url} />

      {/* Zona de click */}
      <div
        onClick={() => !uploading && fileRef.current?.click()}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed transition
          ${uploading ? "cursor-wait opacity-60" : "hover:border-cyan-400/60 hover:bg-cyan-500/5"}
          ${url ? "border-emerald-500/40 bg-emerald-500/5" : "border-white/15 bg-white/[0.03]"}
          p-4 text-center`}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
          className="sr-only"
          onChange={handleFile}
          disabled={uploading}
        />

        {url && isImage(url) && (
          <img
            src={preview ?? url}
            alt="comprobante"
            className="mx-auto mb-2 h-28 rounded-lg object-cover border border-white/10"
          />
        )}

        {url && isPdf(url) && (
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-xl bg-red-500/20 text-3xl">
            📄
          </div>
        )}

        {uploading ? (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-cyan-400">Subiendo… {progress}%</p>
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-cyan-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : url ? (
          <div>
            <p className="text-xs font-semibold text-emerald-400">✓ Comprobante subido</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{fileName ?? "archivo guardado"} · Click para cambiar</p>
          </div>
        ) : (
          <div>
            <p className="text-sm font-semibold text-slate-300">📎 Subir comprobante</p>
            <p className="text-[11px] text-slate-500 mt-0.5">JPG, PNG, PDF · máx 10 MB</p>
          </div>
        )}
      </div>

      {/* Link al comprobante si ya existe */}
      {url && !uploading && (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:underline"
        >
          Ver comprobante →
        </a>
      )}

      {error && (
        <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
