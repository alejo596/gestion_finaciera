import { requireUser } from "@/lib/session"
import { ChangePasswordForm } from "./change-password-form"
import { ShieldAlert } from "lucide-react"

export default async function ChangePasswordPage() {
  // Exigir autenticación pero permitir que el usuario tenga el estado temporal
  const user = await requireUser(true)

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-500">
            <ShieldAlert className="h-6 w-6 animate-pulse" />
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Cambio de Contraseña Obligatorio
          </h2>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-normal">
            Hola, <strong className="text-slate-700 dark:text-slate-300">{user.name}</strong>. Has ingresado con una contraseña temporal de un solo uso. Por motivos de seguridad, debes actualizarla para continuar.
          </p>
        </div>

        <ChangePasswordForm />
      </div>
    </div>
  )
}
