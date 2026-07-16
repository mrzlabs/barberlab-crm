"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createNegocio, type CreateNegocioState } from "./actions";

const input =
  "w-full rounded-control border border-ds-border bg-ds-surface px-3 py-2 text-sm text-ds-fg placeholder:text-ds-fg-subtle outline-none transition-colors focus:border-ds-primary focus:ring-2 focus:ring-ds-ring/60";
const inputError = "border-ds-danger focus:border-ds-danger focus:ring-ds-danger/30";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="mt-1 text-[11px] font-medium text-ds-danger">{error}</p>;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      className="h-control rounded-control bg-ds-primary px-4 text-sm font-medium text-white transition-colors hover:bg-ds-primary-hover disabled:opacity-60"
      type="submit"
      disabled={pending}
    >
      {pending ? "Creando negocio…" : "Crear negocio"}
    </button>
  );
}

export function NegocioCreateForm() {
  const [state, formAction] = useFormState<CreateNegocioState, FormData>(createNegocio, null);
  const formRef = useRef<HTMLFormElement>(null);
  const [nombre, setNombre] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  const errors = state?.ok === false ? state.fieldErrors ?? {} : {};

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      setNombre("");
      setSlug("");
      setSlugTouched(false);
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-card border border-ds-border bg-ds-surface p-5 shadow-ds-sm"
    >
      <p className="text-[12px] font-medium uppercase tracking-wide text-ds-fg-muted">Nuevo cliente SaaS</p>
      <h3 className="text-base font-semibold text-ds-fg">Registrar barbería</h3>

      {state && state.message && (
        <div
          className={`mt-3 rounded-xl border px-3 py-2.5 text-xs font-semibold ${
            state.ok
              ? "border-ds-success/30 bg-ds-success-tint text-ds-success"
              : "border-ds-danger/30 bg-ds-danger-tint text-ds-danger"
          }`}
          role="alert"
        >
          {state.message}
        </div>
      )}

      <div className="mt-4 grid gap-3">
        <div>
          <input
            className={`${input} ${errors.nombre ? inputError : ""}`}
            name="nombre"
            placeholder="Nombre barbería"
            required
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
          />
          <FieldError error={errors.nombre} />
        </div>
        <div>
          <input
            className={`${input} ${errors.slug ? inputError : ""}`}
            name="slug"
            placeholder="slug-barberia (se genera solo)"
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
          />
          <FieldError error={errors.slug} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input className={input} name="telefono" placeholder="Teléfono" />
          <div>
            <input className={`${input} ${errors.correo ? inputError : ""}`} name="correo" placeholder="Correo" type="email" />
            <FieldError error={errors.correo} />
          </div>
        </div>
        <input className={input} name="direccion" placeholder="Dirección" />
        <input className={input} name="representante" placeholder="Representante legal" />
        <div className="grid grid-cols-2 gap-3">
          <select className={input} name="tipoDocumento" defaultValue="cc">
            <option value="cc">Cédula ciudadanía</option>
            <option value="ce">Cédula extranjería</option>
            <option value="nit">NIT</option>
            <option value="pasaporte">Pasaporte</option>
            <option value="pep">PEP</option>
            <option value="ppt">PPT</option>
            <option value="ti">Tarjeta identidad</option>
          </select>
          <input className={input} name="numeroDocumento" placeholder="Número documento" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input className={input} name="ciudadIndicativo" placeholder="Indicativo ciudad" />
          <input className={input} name="contactoPrincipal" placeholder="Contacto principal" />
        </div>
        <textarea className={input} name="descripcion" placeholder="Descripción de la barbería" rows={3} />
        <input className={input} name="slogan" placeholder="Slogan dashboard" />
        <div>
          <input className={`${input} ${errors.logoUrl ? inputError : ""}`} name="logoUrl" placeholder="URL logo" />
          <FieldError error={errors.logoUrl} />
        </div>

        {/* colores */}
        <div
          className="rounded-xl border p-3"
          style={{ background: "var(--ds-surface-2)", borderColor: "var(--ds-border)" }}
        >
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-ds-fg-muted">Identidad visual</p>
          <div className="grid grid-cols-3 gap-2">
            <label className="grid gap-1 text-[11px] font-medium text-ds-fg-muted">
              Principal<input className="h-9 w-full rounded-control border border-ds-border bg-ds-surface" defaultValue="#111827" name="colorPrimario" type="color" />
            </label>
            <label className="grid gap-1 text-[11px] font-medium text-ds-fg-muted">
              Secundario<input className="h-9 w-full rounded-control border border-ds-border bg-ds-surface" defaultValue="#22d3ee" name="colorSecundario" type="color" />
            </label>
            <label className="grid gap-1 text-[11px] font-medium text-ds-fg-muted">
              Acento<input className="h-9 w-full rounded-control border border-ds-border bg-ds-surface" defaultValue="#7c3aed" name="colorAcento" type="color" />
            </label>
          </div>
          <input className={`${input} mt-2`} defaultValue="Outfit" name="fuente" placeholder="Fuente" />
        </div>

        {/* plan / estado / aislamiento */}
        <div className="grid grid-cols-3 gap-2">
          <select className={input} name="plan" defaultValue="pro">
            <option value="starter">Starter</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <select className={input} name="estado" defaultValue="activo">
            <option value="activo">Activo</option>
            <option value="suspendido">Suspendido</option>
            <option value="cancelado">Cancelado</option>
          </select>
          <select className={input} name="modoAislamiento" defaultValue="multi_tenant">
            <option value="multi_tenant">Multi</option>
            <option value="dedicado">Dedicado</option>
          </select>
        </div>

        <div
          className="rounded-xl border p-3"
          style={{ background: "var(--ds-surface-2)", borderColor: "var(--ds-border)" }}
        >
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-ds-fg-muted">Regla contable</p>
          <select className={input} name="comisionBase" defaultValue="precio_final">
            <option value="precio_final">Comisión sobre precio final</option>
            <option value="precio_menos_descuento">Comisión sobre precio menos descuento</option>
            <option value="precio_menos_insumo">Comisión sobre precio menos insumo</option>
          </select>
          <label className="mt-2 flex items-center gap-2 text-xs font-medium text-ds-fg-muted">
            <input name="propinaEnComision" type="hidden" value="false" />
            <input className="size-4 accent-ds-primary" name="propinaEnComision" type="checkbox" value="true" />
            Incluir propina en comisión
          </label>
        </div>

        <input className={input} name="fechaFin" placeholder="Fecha renovación" type="date" />

        {/* admin */}
        <div
          className="rounded-xl border p-3"
          style={{ background: "var(--ds-surface-2)", borderColor: "var(--ds-border)" }}
        >
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-ds-fg-muted">Admin del negocio</p>
          <div className="grid gap-2">
            <div>
              <input className={`${input} ${errors.adminNombre ? inputError : ""}`} name="adminNombre" placeholder="Nombre admin" required />
              <FieldError error={errors.adminNombre} />
            </div>
            <div>
              <input className={`${input} ${errors.adminTelefono ? inputError : ""}`} name="adminTelefono" placeholder="Teléfono admin" required />
              <FieldError error={errors.adminTelefono} />
            </div>
            <div>
              <input className={`${input} ${errors.adminEmail ? inputError : ""}`} name="adminEmail" placeholder="Email admin" required type="email" />
              <FieldError error={errors.adminEmail} />
            </div>
            <div>
              <input className={`${input} ${errors.adminPassword ? inputError : ""}`} name="adminPassword" placeholder="Password inicial (mínimo 8)" required type="password" />
              <FieldError error={errors.adminPassword} />
            </div>
          </div>
        </div>

        <SubmitButton />
      </div>
    </form>
  );
}
