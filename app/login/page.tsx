"use client";

import { useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { loginAction } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Field } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Alert";

const errorMsg: Record<string, string> = {
  invalid: "Datos incompletos o formato inválido.",
  auth: "El usuario no existe o la contraseña no coincide.",
  profile: "La cuenta existe pero no tiene perfil interno vinculado.",
  inactive: "La cuenta o el comercio están inactivos.",
  rate: "Demasiados intentos fallidos. Intenta nuevamente en 5 minutos.",
  negocio_inactivo: "El comercio está suspendido. Contacta a soporte.",
};

function Wordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-[8px] bg-ds-primary text-[15px] font-bold text-white">O</span>
      <span className="text-[19px] font-semibold tracking-tight text-ds-fg">Operux</span>
    </div>
  );
}

export default function LoginPage({ searchParams }: { searchParams: { next?: string; error?: string } }) {
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryMsg, setRecoveryMsg] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function sendRecovery(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.resetPasswordForEmail(recoveryEmail.trim(), { redirectTo: `${window.location.origin}/cambiar-clave` });
    setRecoveryMsg("Si el correo existe recibirás un enlace de recuperación.");
    setSending(false);
  }

  return (
    <main className="ds-root flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-[380px]">
        <div className="mb-6 flex justify-center">
          <Wordmark />
        </div>

        <div className="rounded-card border border-ds-border bg-ds-surface p-6 shadow-ds sm:p-7">
          <div className="mb-5">
            <h1 className="text-lg font-semibold text-ds-fg">Inicia sesión</h1>
            <p className="mt-0.5 text-sm text-ds-fg-muted">Accede al panel de tu negocio.</p>
          </div>

          {searchParams.error && (
            <Alert tone="danger" className="mb-4">
              {errorMsg[searchParams.error] || "No se pudo iniciar sesión."}
            </Alert>
          )}

          <form action={loginAction} className="grid gap-4">
            <input type="hidden" name="next" value={searchParams.next || ""} />

            <Field label="Correo" htmlFor="email">
              <Input id="email" name="email" type="email" required placeholder="tu@correo.com" autoComplete="email" />
            </Field>

            <Field label="Contraseña" htmlFor="password">
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  minLength={8}
                  required
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-ds-fg-subtle transition-colors hover:text-ds-fg-muted"
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>

            <button
              className="-mt-1 w-fit text-[13px] font-medium text-ds-primary hover:text-ds-primary-hover"
              type="button"
              onClick={() => setModalOpen(true)}
            >
              ¿Olvidaste tu contraseña?
            </button>

            <label className="flex items-start gap-2.5 text-[13px] leading-5 text-ds-fg-muted">
              <input
                className="mt-0.5 size-4 shrink-0 accent-ds-primary"
                type="checkbox"
                name="terms"
                value="accepted"
                checked={termsAccepted}
                onChange={(event) => setTermsAccepted(event.target.checked)}
                required
              />
              <span>
                Acepto los{" "}
                <a className="font-medium text-ds-primary hover:text-ds-primary-hover" href="/terminos" target="_blank" rel="noopener noreferrer">
                  Términos y Condiciones
                </a>{" "}
                y la{" "}
                <a className="font-medium text-ds-primary hover:text-ds-primary-hover" href="/privacidad" target="_blank" rel="noopener noreferrer">
                  Política de Tratamiento de Datos
                </a>
              </span>
            </label>

            <Button type="submit" size="lg" className="mt-1 w-full" disabled={!termsAccepted}>
              Entrar al sistema
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-[12px] text-ds-fg-subtle">
          <a className="hover:text-ds-fg-muted" href="/terminos">Términos</a>
          {" · "}
          <a className="hover:text-ds-fg-muted" href="/privacidad">Tratamiento de datos</a>
        </p>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-30 grid place-items-center bg-ds-fg/40 p-4" onClick={() => setModalOpen(false)}>
          <form
            className="w-full max-w-[380px] rounded-card border border-ds-border bg-ds-surface p-6 shadow-ds-lg"
            onSubmit={sendRecovery}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-ds-fg">Recuperar contraseña</h2>
              <button
                className="rounded-control p-1.5 text-ds-fg-subtle transition-colors hover:bg-ds-surface-2 hover:text-ds-fg-muted"
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Cerrar"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="mt-1 text-sm text-ds-fg-muted">Te enviaremos un enlace para restablecerla.</p>
            <Field label="Correo" htmlFor="recovery-email" className="mt-4">
              <Input
                id="recovery-email"
                type="email"
                required
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                placeholder="tu@correo.com"
              />
            </Field>
            {recoveryMsg && (
              <Alert tone="success" className="mt-3">{recoveryMsg}</Alert>
            )}
            <Button type="submit" size="lg" className="mt-4 w-full" loading={sending}>
              Enviar enlace
            </Button>
          </form>
        </div>
      )}
    </main>
  );
}
