import { requireRole } from "@/lib/auth/session";
import { changePasswordAction } from "./actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export const dynamic = "force-dynamic";

export default async function AdminPerfilPage({
  searchParams,
}: {
  searchParams: { success?: string; error?: string };
}) {
  const profile = await requireRole(["admin", "super_admin"]);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader
        title="Cambiar contraseña"
        description={`${profile.nombre} · ${profile.email}`}
      />

      {searchParams.success && <Alert tone="success">Contraseña actualizada correctamente.</Alert>}
      {searchParams.error === "current" && <Alert tone="danger">La contraseña actual es incorrecta.</Alert>}
      {searchParams.error && searchParams.error !== "current" && (
        <Alert tone="danger">Datos inválidos. Verifica que las contraseñas coincidan y tengan mínimo 8 caracteres.</Alert>
      )}

      <Card>
        <CardBody>
          <form action={changePasswordAction} className="grid gap-4">
            <Field label="Contraseña actual" htmlFor="currentPassword">
              <Input id="currentPassword" name="currentPassword" type="password" minLength={8} required autoComplete="current-password" />
            </Field>
            <Field label="Nueva contraseña" htmlFor="newPassword">
              <Input id="newPassword" name="newPassword" type="password" minLength={8} required autoComplete="new-password" />
            </Field>
            <Field label="Confirmar nueva contraseña" htmlFor="confirmPassword">
              <Input id="confirmPassword" name="confirmPassword" type="password" minLength={8} required autoComplete="new-password" />
            </Field>
            <Button type="submit" size="lg" className="justify-self-start">Actualizar contraseña</Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
