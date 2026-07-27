"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signUp } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Wallet, Loader2 } from "lucide-react"

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("apoderado")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) {
      toast.error("Por favor, completa todos los campos requeridos")
      return
    }

    setIsLoading(true)
    try {
      await signUp.email(
        {
          email,
          password,
          name,
          data: {
            role: role,
          },
        },
        {
          onRequest: () => setIsLoading(true),
          onSuccess: () => {
            toast.success("¡Cuenta creada exitosamente! Iniciando sesión...")
            router.push("/dashboard")
            router.refresh()
          },
          onError: (ctx) => {
            setIsLoading(false)
            toast.error(ctx.error.message || "Error al registrar la cuenta")
          },
        }
      )
    } catch (err: any) {
      setIsLoading(false)
      toast.error("Error al registrar la cuenta")
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-radial from-slate-900 via-slate-950 to-black px-4 py-8 text-slate-100">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-400 ring-1 ring-emerald-500/30">
            <Wallet className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Finanzas Familiares
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Comienza a administrar los ingresos y gastos de tu hogar hoy
          </p>
        </div>

        <Card className="border-slate-800/80 bg-slate-900/60 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold text-white">Crear Cuenta</CardTitle>
            <CardDescription className="text-slate-400">
              Completa la información para registrarte
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">Nombre Completo</Label>
                <Input
                  id="name"
                  placeholder="Juan Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  required
                  className="border-slate-800 bg-slate-950/50 text-slate-200 placeholder:text-slate-600 focus-visible:ring-emerald-500/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className="border-slate-800 bg-slate-950/50 text-slate-200 placeholder:text-slate-600 focus-visible:ring-emerald-500/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="border-slate-800 bg-slate-950/50 text-slate-200 placeholder:text-slate-600 focus-visible:ring-emerald-500/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role" className="text-slate-300">Rol Familiar</Label>
                <Select value={role} onValueChange={setRole} disabled={isLoading}>
                  <SelectTrigger className="border-slate-800 bg-slate-950/50 text-slate-200 focus-visible:ring-emerald-500/50">
                    <SelectValue placeholder="Selecciona tu rol" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-800 bg-slate-900 text-slate-200">
                    <SelectItem value="apoderado">Apoderado (Padre / Madre)</SelectItem>
                    <SelectItem value="profesor">Profesor (Colaborador)</SelectItem>
                    <SelectItem value="admin">Administrador del Hogar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20 active:scale-[0.98] duration-150"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando cuenta...
                  </>
                ) : (
                  "Registrarme"
                )}
              </Button>
              <div className="text-center text-xs text-slate-400">
                ¿Ya tienes una cuenta?{" "}
                <Link
                  href="/sign-in"
                  className="font-medium text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
                >
                  Inicia sesión aquí
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  )
}
