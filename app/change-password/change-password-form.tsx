"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { actualizarContraseñaObligatoria } from "@/lib/actions-family"
import { KeyRound, Lock, Eye, EyeOff } from "lucide-react"

export function ChangePasswordForm() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Por favor completa todos los campos.")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("Las nuevas contraseñas no coinciden.")
      return
    }

    if (newPassword.length < 8) {
      toast.error("La nueva contraseña debe tener al menos 8 caracteres.")
      return
    }

    setIsSubmitting(true)
    try {
      await actualizarContraseñaObligatoria({
        currentPassword,
        newPassword,
      })
      toast.success("Contraseña actualizada correctamente.")
      // Recargar la sesión y redirigir
      router.refresh()
      router.push("/dashboard")
    } catch (err: any) {
      toast.error(err.message || "Error al actualizar la contraseña. Revisa tus credenciales.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/60 backdrop-blur-sm shadow-xl">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="current" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Contraseña Temporal Actual *
            </Label>
            <div className="relative">
              <Input
                id="current"
                type={showCurrent ? "text" : "password"}
                placeholder="Ingresa la clave temporal"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 pr-10 text-xs text-slate-800 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="new" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Nueva Contraseña *
            </Label>
            <div className="relative">
              <Input
                id="new"
                type={showNew ? "text" : "password"}
                placeholder="Mínimo 8 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 pr-10 text-xs text-slate-800 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="confirm" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Confirmar Nueva Contraseña *
            </Label>
            <Input
              id="confirm"
              type="password"
              placeholder="Repite la nueva contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-5 flex items-center justify-center gap-2 mt-2 shadow-lg shadow-indigo-600/10 text-xs"
          >
            {isSubmitting ? "Actualizando..." : "Actualizar Contraseña y Entrar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
