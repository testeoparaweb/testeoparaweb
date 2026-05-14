import { AuthShell } from "@/components/auth-shell";
import { UpdatePasswordForm } from "@/components/update-password-form";

export default function Page() {
  return (
    <AuthShell
      description="Definí una nueva contraseña para volver a entrar al ERP con normalidad."
      eyebrow="Actualizacion de acceso"
      title="Cambiar contraseña"
    >
        <UpdatePasswordForm />
    </AuthShell>
  );
}
