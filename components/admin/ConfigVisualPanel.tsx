"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { ImagePlus, RotateCcw, Trash2, Moon, Sun, X } from "lucide-react";
import { uploadNegocioBgPhoto, removeNegocioBgPhoto, updateConfigVisual, resetConfigVisual } from "@/app/admin/configuracion/actions";
import { FONT_OPTIONS } from "@/components/layout/FontLoader";

export function ConfigVisualPanel({
  darkMode: initialDark,
  bgPhotoUrl: initialBg,
  fontFamily: initialFont = "Inter",
}: {
  darkMode?: boolean;
  bgPhotoUrl?: string | null;
  fontFamily?: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDark, setIsDark] = useState(initialDark ?? true);
  const [fontFamily, setFontFamily] = useState(initialFont ?? "Inter");
  const [bgUrl, setBgUrl] = useState(initialBg ?? null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleDarkToggle() {
    const next = !isDark;
    setIsDark(next);
    const fd = new FormData();
    fd.set("darkMode", String(next));
    fd.set("fontFamily", fontFamily);
    startTransition(async () => {
      await updateConfigVisual(fd);
      router.refresh();
    });
  }

  function handleFontChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    setFontFamily(next);
    const fd = new FormData();
    fd.set("darkMode", String(isDark));
    fd.set("fontFamily", next);
    startTransition(async () => {
      await updateConfigVisual(fd);
      router.refresh();
    });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
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
      <p className="mt-1 text-sm text-slate-400">
        La foto se usa como logo de perfil y marca del negocio. El fondo mantiene el grid y las conexiones neuronales con la paleta activa.
      </p>

      {/* Tema oscuro / claro */}
      <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/10 bg-white/6 px-5 py-4">
        <div>
          <p className="text-sm font-bold text-auto">Tema oscuro / Tema claro</p>
          <p className="mt-0.5 text-xs text-slate-400">
            {isDark ? "Oscuro — fondo oscuro con neural canvas." : "Claro — apariencia light del dashboard."}
          </p>
        </div>
        <button
          type="button"
          onClick={handleDarkToggle}
          disabled={isPending}
          className={`relative flex h-8 w-14 items-center rounded-full transition-colors disabled:opacity-60 ${isDark ? "bg-cyan-900" : "bg-slate-200"}`}
          aria-label="Toggle dark mode"
        >
          <span
            className={`absolute flex size-6 items-center justify-center rounded-full shadow transition-transform ${isDark ? "translate-x-7 bg-cyan-400" : "translate-x-1 bg-white"}`}
          >
            {isDark ? <Moon className="size-3 text-slate-900" /> : <Sun className="size-3 text-amber-500" />}
          </span>
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/6 px-5 py-4">
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
        <p className="mt-2 text-xs text-slate-500">
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
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-auto transition hover:border-violet-400 hover:bg-white dark:border-white/20 dark:bg-white/6"
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

        {error && (
          <p className="mt-2 text-sm font-bold text-red-600">{error}</p>
        )}
        <p className="mt-2 text-xs text-slate-400">JPG, PNG, WebP o AVIF. Máximo 5 MB. Se aplica al logo, perfil y aura visual del CRM.</p>
      </div>

      {/* Restablecer colores estándar */}
      <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4">
        <div>
          <p className="text-sm font-bold text-slate-800">Restablecer colores estándar</p>
          <p className="mt-0.5 text-xs text-slate-500">Vuelve a la paleta predeterminada: cyan, violeta y rosa.</p>
        </div>
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              await resetConfigVisual();
              router.refresh();
            });
          }}
          className="flex items-center gap-2 rounded-xl bg-slate-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-500 disabled:opacity-60"
        >
          <RotateCcw className="size-4" />
          Restablecer estándar
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

