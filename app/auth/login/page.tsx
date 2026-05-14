import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <AuthShell
      description="Accedé al sistema con un usuario creado por el administrador. Desde acá entran caja, análisis, stock y el resto del ERP."
      eyebrow="Acceso privado"
      title="Entrá al sistema"
    >
        <LoginForm />
    </AuthShell>
  );
}
