"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateUserRole, createSystemUser, deleteSystemUser } from "@/lib/actions-user"
import { formatDate } from "@/lib/format"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Key, Users, Info, ShieldAlert, Plus, Trash2 } from "lucide-react"

type UsersPermissionsContentProps = {
  initialUsers: any[]
}

const ROLES = [
  { id: "webmaster", name: "Webmaster (Acceso Total)" },
  { id: "admin", name: "Administrador General" },
  { id: "admin_colegio", name: "Administrador de Colegio" },
  { id: "admin_curso", name: "Administrador de Curso" },
  { id: "apoderado", name: "Apoderado (Portal Escolar)" },
  { id: "admin_condominio", name: "Administrador de Condominio" },
  { id: "copropietario", name: "Copropietario (Portal Condominio)" },
  { id: "invitado", name: "Usuario Invitado (Datos Ficticios)" },
]

export function UsersPermissionsContent({ initialUsers }: UsersPermissionsContentProps) {
  const router = useRouter()
  const [users, setUsers] = useState(initialUsers)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  
  // Registration Form Modal state
  const [isOpen, setIsOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newRole, setNewRole] = useState("apoderado")
  const [isCreating, setIsCreating] = useState(false)

  const handleRoleChange = async (userId: string, newRoleValue: string) => {
    setIsUpdating(userId)
    try {
      await updateUserRole(userId, newRoleValue)
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRoleValue } : u))
      )
      toast.success("Rol y permisos del usuario actualizados con éxito")
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Error al actualizar los permisos")
    } finally {
      setIsUpdating(null)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      toast.error("Por favor completa todos los campos")
      return
    }

    setIsCreating(true)
    try {
      await createSystemUser({
        name: newName,
        email: newEmail,
        password: newPassword,
        role: newRole,
      })
      toast.success("Usuario registrado exitosamente")
      setIsOpen(false)
      // Reset form
      setNewName("")
      setNewEmail("")
      setNewPassword("")
      setNewRole("apoderado")
      
      // Reload user list
      router.refresh()
      window.location.reload()
    } catch (err: any) {
      toast.error(err.message || "Error al registrar el usuario")
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente al usuario "${userName}"?`)) {
      return
    }

    try {
      await deleteSystemUser(userId)
      setUsers((prev) => prev.filter((u) => u.id !== userId))
      toast.success("Usuario eliminado exitosamente")
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar el usuario")
    }
  }

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
            Gestión de Permisos y Usuarios
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Registra nuevos perfiles y otorga roles de visualización a los usuarios del sistema
          </p>
        </div>
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> Registrar Usuario
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Users Table */}
        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm md:col-span-2">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <CardTitle className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-500" />
              Usuarios Registrados
            </CardTitle>
            <CardDescription className="text-xs">
              Asigna roles específicos para habilitar la visibilidad de los portales correspondientes
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                    <TableHead className="text-xs font-semibold pl-6">Nombre de Usuario</TableHead>
                    <TableHead className="text-xs font-semibold">Correo Electrónico</TableHead>
                    <TableHead className="text-xs font-semibold">Fecha Registro</TableHead>
                    <TableHead className="text-xs font-semibold">Permisos / Rol Habilitado</TableHead>
                    <TableHead className="text-right text-xs font-semibold pr-6">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow
                      key={u.id}
                      className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/30"
                    >
                      <TableCell className="font-semibold text-xs py-3.5 pl-6 text-slate-850 dark:text-slate-200">
                        {u.name}
                      </TableCell>
                      <TableCell className="text-slate-500 py-3.5">{u.email}</TableCell>
                      <TableCell className="text-slate-500 py-3.5">{formatDate(u.createdAt)}</TableCell>
                      <TableCell className="py-3.5">
                        <select
                          value={u.role}
                          disabled={isUpdating === u.id}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="rounded-md border border-slate-200 bg-slate-50 p-1.5 text-xs text-indigo-600 font-bold outline-none dark:border-slate-800 dark:bg-slate-950 min-w-[180px] disabled:opacity-50"
                        >
                          {ROLES.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell className="text-right pr-6 py-3.5">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="text-rose-500 hover:text-rose-650 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Roles Info Guide */}
        <div className="space-y-6">
          <Card className="border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-900/60 shadow-xs leading-normal">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <Info className="h-4 w-4 text-indigo-500" />
                Guía de Roles y Permisos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-[10px] text-slate-500">
              <div>
                <strong className="text-indigo-500 block text-xs">Webmaster</strong>
                <span>Habilita la visualización de TODOS los módulos de la plataforma: Finanzas del Hogar, Administración Escolar, Portal Escolar Apoderado, Administración de Condominio y Residente.</span>
              </div>
              <div>
                <strong className="text-indigo-500 block text-xs font-bold text-rose-500">Invitado</strong>
                <span>Acceso exclusivo a paneles y simuladores con **datos ficticios aislados** para pruebas del sistema sin afectar la base de datos real.</span>
              </div>
              <div>
                <strong className="text-indigo-500 block text-xs">Apoderado</strong>
                <span>Habilita de forma exclusiva el **Portal Escolar Apoderado** (consultas de cuotas, simulador de pagos, comprobantes y egresos del curso).</span>
              </div>
              <div>
                <strong className="text-indigo-500 block text-xs">Admin Curso</strong>
                <span>Habilita el Portal Escolar Apoderado y el panel de administración escolar específico para su curso (crear cuotas, metas, egresos y auditar pagos).</span>
              </div>
              <div>
                <strong className="text-indigo-500 block text-xs">Admin Condominio</strong>
                <span>Habilita el panel de administración de condominios (crear departamentos, emisión masiva de gastos comunes por prorrateo y egresos).</span>
              </div>
              <div>
                <strong className="text-indigo-500 block text-xs">Copropietario</strong>
                <span>Habilita el portal residente de condominios (revisión de cobros, carro de pago de gastos comunes, comprobantes).</span>
              </div>
              <div>
                <strong className="text-indigo-500 block text-xs">General / Hogar</strong>
                <span>Habilita el acceso al módulo privado **Finanzas del Hogar** (ingresos, gastos, alimentación).</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-rose-500/20 bg-rose-500/5 dark:border-rose-500/10 dark:bg-rose-950/10 shadow-xs leading-normal">
            <CardContent className="pt-4 flex gap-3 text-[10px] text-rose-600 dark:text-rose-400">
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <strong>Acceso Restringido:</strong> Solo el rol Webmaster puede ver y acceder a este módulo de permisos globales. Asegúrate de verificar las direcciones de correo electrónico antes de otorgar privilegios administrativos.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Register User Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs">
          <form onSubmit={handleCreateUser}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-800 dark:text-white">Registrar Nuevo Usuario</DialogTitle>
              <DialogDescription className="text-xs">
                Crea una nueva cuenta de acceso asignándole un rol y privilegios iniciales.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-slate-600 dark:text-slate-400 font-bold">Nombre Completo</Label>
                <Input
                  id="name"
                  placeholder="Ej: Juan Pérez"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="text-xs bg-slate-50 dark:bg-slate-950"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email" className="text-slate-600 dark:text-slate-400 font-bold">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="juan.perez@correo.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="text-xs bg-slate-50 dark:bg-slate-950"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="pass" className="text-slate-600 dark:text-slate-400 font-bold">Contraseña</Label>
                <Input
                  id="pass"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="text-xs bg-slate-50 dark:bg-slate-950"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role-select" className="text-slate-600 dark:text-slate-400 font-bold">Rol y Permisos</Label>
                <select
                  id="role-select"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 p-2 text-xs text-slate-750 dark:border-slate-800 dark:bg-slate-950 outline-none font-medium"
                >
                  {ROLES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="text-xs border-slate-200 hover:bg-slate-50 text-slate-700"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                {isCreating ? "Registrando..." : "Registrar Cuenta"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
