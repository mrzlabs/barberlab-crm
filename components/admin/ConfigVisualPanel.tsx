"use client";

import { useRef, useState, useTransition } from "react";
import { ImagePlus, Trash2, Moon, Sun } from "lucide-react";
import { uploadNegocioBgPhoto, removeNegocioBgPhoto, updateConfigVisual } from "@/app/admin/configuracion/actions";

export function ConfigVisualPanel({
  darkMode: initialDark,
  bgPhotoUrl: initialBg,
}: {
  darkMode?: boolean;
  bgPhotoUrl?: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [isDark, setIsDark] = useState(!!initialDark);
  const [bgUrl, setBgUrl] = useState(initialBg ?? null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleDarkToggle() {
    const next = !isDark;
    setIsDark(next);
    const fd = new FormData();
    fd.set("darkMode", String(next));
    startTransition(() => updateConfigVisual(fd));
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
    startTransition(async () => {
      const res = await uploadNegocioBgPhoto(fd);
      if (res && "error" in res && typeof res.error === "string") {
        setError(res.error);
      } else if (res && "url" in res && res.url) {
        setBgUrl(res.url);
        setPreview(null);
        if (fileRef.current) fileRef.current.value = "";
      }
    });
  }

  function handleRemove() {
    startTransition(async () => {
      await removeNegocioBgPhoto();
      setBgUrl(null);
      setPreview(null);
    });
  }

  const displayUrl = preview ?? bgUrl;

  return (
    <div className="mt-6 rounded-[1.5rem] border bg-white p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">Identidad visual avanzada</p>
      <p className="mt-1 text-sm text-slate-500">
        La foto se usa como logo de perfil, marca del negocio y fondo visual del CRM con blur controlado.
      </p>

      {/* Dark / Light toggle */}
      <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4">
        <div>
          <p className="text-sm font-bold text-slate-800">Modo de color</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {isDark ? "Oscuro — cards y paneles en fondo oscuro." : "Claro — apariencia estándar del dashboard."}
          </p>
        </div>
        <button
          type="button"
          onClick={handleDarkToggle}
          disabled={isPending}
          className={`relative flex h-8 w-14 items-center rounded-full transition-colors ${isDark ? "bg-slate-900" : "bg-slate-200"}`}
          aria-label="Toggle dark mode"
        >
          <span
            className={`absolute flex size-6 items-center justify-center rounded-full shadow transition-transform ${isDark ? "translate-x-7 bg-cyan-400" : "translate-x-1 bg-white"}`}
          >
            {isDark ? <Moon className="size-3 text-slate-900" /> : <Sun className="size-3 text-amber-500" />}
          </span>
        </button>
      </div>

      {/* Foto de fondo */}
      <div className="mt-4">
        <p className="mb-3 text-sm font-bold text-slate-700">Foto de perfil y fondo del negocio</p>

        {/* preview strip */}
        {displayUrl && (
          <div className="relative mb-4 h-36 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
            <img src={displayUrl} alt="Preview fondo" className="h-full w-full object-cover" style={{ filter: "blur(8px)", transform: "scale(1.05)" }} />
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/30">
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-black text-slate-700">
                Preview con blur + 15% opacity
              </span>
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
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-violet-400 hover:bg-white"
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
        <p className="mt-2 text-xs text-slate-400">JPG, PNG, WebP o AVIF. Máximo 5 MB. Se aplica al logo, perfil y background del CRM.</p>
      </div>
    </div>
  );
}
