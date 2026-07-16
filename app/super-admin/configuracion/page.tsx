"use client";

import { useState } from "react";

const sa = "bg-ds-surface-2 border border-ds-border rounded-2xl p-5";
const lbl = "block text-xs font-bold uppercase tracking-widest text-ds-fg-muted mb-1.5";
const inp = "w-full rounded-xl bg-ds-surface-2 border border-ds-border px-3 py-2.5 text-sm text-ds-fg placeholder:text-ds-fg-subtle outline-none focus:border-ds-primary/60 transition";

export default function SuperAdminConfiguracionPage() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-card bg-ds-surface p-5 shadow-ds-sm sm:p-8">
        <div className="relative">
          <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-ds-primary sm:mt-8">MRZLABS · Plataforma</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-4xl">Configuración global</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ds-fg-muted">
            Branding de la plataforma, email de soporte y límites globales aplicados a todos los negocios.
          </p>
        </div>
      </section>

      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Guardado (demo — conectar a DB en implementación final)"); }}>

        {/* Branding */}
        <div className={sa}>
          <h3 className="mb-4 font-semibold text-ds-fg">Branding de la plataforma</h3>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={lbl}>Nombre de la plataforma</label>
              <input className={inp} defaultValue="BarberLab CRM" name="platformName" />
            </div>
            <div>
              <label className={lbl}>Dominio principal</label>
              <input className={inp} defaultValue="barberlab.app" name="domain" />
            </div>
            <div className="sm:col-span-2">
              <label className={lbl}>Logo (upload)</label>
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <img src={logoPreview} alt="Preview" className="h-16 w-16 rounded-2xl object-contain ring-2 ring-white/10" />
                ) : (
                  <div className="grid h-16 w-16 place-items-center rounded-2xl bg-ds-surface-2 text-xs text-ds-fg-subtle">Logo</div>
                )}
                <label className="cursor-pointer rounded-xl bg-ds-surface-2 px-4 py-2.5 text-sm font-bold text-ds-fg hover:bg-white/15 transition">
                  Seleccionar imagen
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => setLogoPreview(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
                {logoPreview && (
                  <button type="button" className="text-xs text-ds-danger hover:text-ds-danger" onClick={() => setLogoPreview(null)}>
                    Quitar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Soporte */}
        <div className={sa}>
          <h3 className="mb-4 font-semibold text-ds-fg">Contacto y soporte</h3>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={lbl}>Email de soporte</label>
              <input className={inp} defaultValue="soporte@barberlab.app" name="supportEmail" type="email" />
            </div>
            <div>
              <label className={lbl}>WhatsApp soporte</label>
              <input className={inp} defaultValue="+57 350 380 3010" name="supportWhatsapp" />
            </div>
          </div>
        </div>

        {/* Límites globales */}
        <div className={sa}>
          <h3 className="mb-4 font-semibold text-ds-fg">Límites globales</h3>
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className={lbl}>Máx empleados (Starter)</label>
              <input className={inp} defaultValue="3" name="maxEmpleadosStarter" type="number" min="1" />
            </div>
            <div>
              <label className={lbl}>Máx empleados (Pro)</label>
              <input className={inp} defaultValue="10" name="maxEmpleadosPro" type="number" min="1" />
            </div>
            <div>
              <label className={lbl}>Máx empleados (Enterprise)</label>
              <input className={inp} defaultValue="50" name="maxEmpleadosEnterprise" type="number" min="1" />
            </div>
            <div>
              <label className={lbl}>Días de retención de logs</label>
              <input className={inp} defaultValue="90" name="logRetentionDays" type="number" min="7" />
            </div>
            <div>
              <label className={lbl}>Período de prueba (días)</label>
              <input className={inp} defaultValue="14" name="trialDays" type="number" min="1" />
            </div>
          </div>
        </div>

        <button
          className="rounded-2xl bg-ds-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-ds-primary-hover"
          type="submit"
        >
          Guardar configuración
        </button>
      </form>
    </div>
  );
}
