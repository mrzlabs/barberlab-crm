"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { ImagePlus, RotateCcw, Trash2, X } from "lucide-react";
import { uploadNegocioBgPhoto, removeNegocioBgPhoto, updateConfigVisual, resetConfigVisual } from "@/app/admin/configuracion/actions";
import { FONT_OPTIONS } from "@/components/layout/FontLoader";

export function ConfigVisualPanel({
  bgPhotoUrl: initialBg,
  fontFamily: initialFont = "Inter",
}: {
  bgPhotoUrl?: string | null;
  fontFamily?: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fontFamily, setFontFamily] = useState(initialFont ?? "Inter");
  const [bgUrl, setBgUrl] = useState(initialBg ?? null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  function extractDominantColors(url: string): Promise<string[]> {
    return new Promise((resolve) => {
      const img = document.createElement("img");
      img.onload = () => {
        const cv = document.createElement("canvas");
        cv.width = 60; cv.height = 60;
        const ctx = cv.getContext("2d");
        if (!ctx) { resolve([]); return; }
        ctx.drawImage(img, 0, 0, 60, 60);
        const px = ctx.getImageData(0, 0, 60, 60).data;
        const buckets: Record<string, number> = {};
        for (let i = 0; i < px.length; i += 4) {
          if (px[i + 3] < 128) continue;
          const r = Math.round(px[i] / 32) * 32;
          const g = Math.round(px[i + 1] / 32) * 32;
          const b = Math.round(px[i + 2] / 32) * 32;
          const k = `${r},${g},${b}`;
          buckets[k] = (buckets[k] || 0) + 1;
        }
        const picked: string[] = [];
        for (const [k] of Object.entries(buckets).sort((a, b) => b[1] - a[1]).slice(0, 40)) {
          if (picked.length >= 3) break;
          const [r, g, b] = k.split(",").map(Number);
          const near = picked.some(h => {
            const cr = parseInt(h.slice(1,3),16), cg = parseInt(h.slice(3,5),16), cb = parseInt(h.slice(5,7),16);
            return Math.abs(r-cr)+Math.abs(g-cg)+Math.abs(b-cb) < 96;
          });
          if (!near) picked.push(`#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`);
        }
        resolve(picked);
      };
      img.onerror = () => resolve([]);
      img.src = url;
    });
  }

  function handleFontChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    setFontFamily(next);
    const fd = new FormData();
    fd.set("darkMode", "true");
    fd.set("fontFamily", next);
    startTransition(async () => {
      await updateConfigVisual(fd);
      router.refresh();
    });
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    const colors = await extractDominantColors(objectUrl);
    setExtractedColors(colors);
  }

  function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.set("bgPhoto", file);
    setError(null);
    startTransition(async () => {
      try {
        const res = await uploadNegocioBgPhoto(fd);
        if (res && "error" in res && typeof res.error === "string") {
          setError(res.error);
        } else if (res && "url" in res && res.url) {
          setBgUrl(res.url);
          setPreview(null);
          if (fileRef.current) fileRef.current.value = "";
          router.refresh();
        }
      } catch {
        setError("Error al guardar la foto. Verifica tu conexión e intenta de nuevo.");
      }
    });
  }

  function handleRemove() {
    startTransition(async () => {
      try {
        await removeNegocioBgPhoto();
        setBgUrl(null);
        setPreview(null);
        router.refresh();
      } catch {
        setError("Error al eliminar la foto. Intenta de nuevo.");
      }
    });
  }

  const displayUrl = preview ?? bgUrl;

  return (
    <div className="glass-panel mt-6 rounded-[1.5rem] p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-400">Identidad visual avanzada</p>
      <p className="mt-1 text-sm crm-text-muted">
        La foto se usa como logo de perfil y marca del negocio. El fondo mantiene el grid y las conexiones neuronales con la paleta activa.
      </p>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/6 px-5 py-4">
        <label className="grid gap-2 text-sm font-bold text-auto">
          Fuente del CRM
          <select
            className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500"
            value={fontFamily}
            onChange={handleFontChange}
            disabled={isPending}
          >
            {FONT_OPTIONS.map((font) => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </label>
        <p className="mt-2 text-xs crm-text-muted">
          Se guarda en config_visual.fontFamily y se aplica al shell del CRM.
        </p>
      </div>

      {/* Foto de fondo */}
      <div className="mt-4">
        <p className="mb-3 text-sm font-bold text-auto">Logo y foto de perfil del negocio</p>

        {/* preview strip */}
        {displayUrl && (
          <div className="relative mb-4 h-36 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
            <Image src={displayUrl} alt="Preview fondo" className="object-cover" fill sizes="(max-width: 768px) 100vw, 640px" style={{ filter: "blur(8px)", transform: "scale(1.05)" }} unoptimized />
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/30">
              <button
                className="rounded-full bg-white/90 px-3 py-1 text-xs font-black text-slate-700 transition hover:bg-white"
                onClick={() => setExpandedPhoto(displayUrl)}
                type="button"
              >
                Preview de logo y aura de marca
              </button>
            </div>
            {!preview && bgUrl && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={isPending}
                className="absolute right-3 top-3 flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg transition hover:bg-red-700"
              >
                <Trash2 className="size-3.5" /> Quitar foto
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleUpload} className="flex items-center gap-3">
          <label
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/8 px-4 py-3 text-sm font-semibold text-auto transition hover:border-violet-400 hover:bg-white/12"
          >
            <ImagePlus className="size-4 text-violet-500" />
            <span>{preview ? "Foto seleccionada" : "Subir foto de marca"}</span>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          {preview && (
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-violet-950 disabled:opacity-60"
            >
              {isPending ? "Subiendo..." : "Guardar foto"}
            </button>
          )}
        </form>

        {extractedColors.length > 0 && (
          <div className="mt-3 rounded-xl border border-white/10 bg-white/6 p-3">
            <p className="mb-2.5 text-[10px] font-black uppercase tracking-widest crm-text-muted">Paleta sugerida de la foto</p>
            <div className="flex gap-4">
              {extractedColors.map((color) => (
                <div key={color} className="flex flex-col items-center gap-2">
                  <span className="size-9 rounded-xl border border-white/20 shadow-sm" style={{ backgroundColor: color }} />
                  <p className="text-[9px] font-mono crm-text-muted">{color}</p>
                  <div className="flex flex-col gap-1">
                    {(["colorPrimario", "colorSecundario", "colorAcento"] as const).map((field, i) => (
                      <button
                        key={field}
                        type="button"
                        onClick={() => window.dispatchEvent(new CustomEvent("operux:apply-color", { detail: { field, color } }))}
                        className="rounded-lg px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-white/60 transition hover:bg-white/12 hover:text-white"
                      >
                        {["Principal", "Secundario", "Acento"][i]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {error && (
          <p className="mt-2 text-sm font-bold text-red-600">{error}</p>
        )}
        <p className="mt-2 text-xs crm-text-muted">JPG, PNG, WebP o AVIF. Máximo 5 MB. Se aplica al logo, perfil y aura visual del CRM.</p>
      </div>

      {/* Restablecer colores estándar */}
      <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/6 px-5 py-4">
        <div>
          <p className="text-sm font-bold crm-text-primary">Restablecer colores estándar</p>
          <p className="mt-0.5 text-xs crm-text-muted">
            {extractedColors.length >= 3
              ? "Aplica los 3 colores dominantes de tu foto a la paleta del negocio."
              : "Vuelve a la paleta predeterminada: cyan, violeta y rosa."}
          </p>
        </div>
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (extractedColors.length >= 3) {
              const [p, s, a] = extractedColors;
              (["colorPrimario", "colorSecundario", "colorAcento"] as const).forEach((field, i) => {
                window.dispatchEvent(new CustomEvent("operux:apply-color", { detail: { field, color: [p, s, a][i] } }));
              });
            } else {
              startTransition(async () => { await resetConfigVisual(); router.refresh(); });
            }
          }}
          className="flex items-center gap-2 rounded-xl bg-slate-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-500 disabled:opacity-60"
        >
          <RotateCcw className="size-4" />
          {extractedColors.length >= 3 ? "Restaurar paleta de foto" : "Restablecer estándar"}
        </button>
      </div>
      {expandedPhoto && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/72 p-4 backdrop-blur-xl" onClick={() => setExpandedPhoto(null)}>
          <button className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/10 p-3 text-white transition hover:bg-white/20" onClick={() => setExpandedPhoto(null)} type="button" aria-label="Cerrar foto">
            <X className="size-5" />
          </button>
          <div className="relative aspect-square w-[min(86vw,560px)] overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 shadow-2xl shadow-violet-950/40" onClick={(event) => event.stopPropagation()}>
            <Image src={expandedPhoto} alt="Foto de marca ampliada" className="object-cover" fill sizes="(max-width: 640px) 86vw, 560px" unoptimized priority />
          </div>
        </div>
      )}
    </div>
  );
}

