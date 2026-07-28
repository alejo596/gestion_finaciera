"use client"

import * as React from "react"
import { useState } from "react"
import { formatCLP, formatDate } from "@/lib/format"
import {
  crearFamiliaConAdministrador,
  reenviarInvitacion,
} from "@/lib/actions-family"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Plus, Users, Mail, ShieldAlert, KeyRound, Copy, CheckCircle2, RotateCw } from "lucide-react"

type FamiliasContentProps = {
  initialFamilias: any[]
}

export function FamiliasContent({ initialFamilias }: FamiliasContentProps) {
  const [familias, setFamilias] = useState(initialFamilias)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form states
  const [nombreFamilia, setNombreFamilia] = useState("")
  const [emailFamilia, setEmailFamilia] = useState("")
  const [nombreAdmin, setNombreAdmin] = useState("")
  const [emailAdmin, setEmailAdmin] = useState("")

  // Result dialog for copying credentials
  const [resultData, setResultData] = useState<{
    success: boolean
    tempPassword?: string
    invitationLink?: string
    emailAdmin?: string
  } | null>(null)

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombreFamilia || !emailFamilia || !nombreAdmin || !emailAdmin) {
      toast.error("Por favor completa todos los campos obligatorios.")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await crearFamiliaConAdministrador({
        nombreFamilia,
        emailFamilia,
        nombreAdmin,
        emailAdmin,
      })

      // Re-fetch families list or update local state manually
      // We can reload the page or append to list. Let's append to state:
      const newFam = {
        id: res.familyId,
        nombre: nombreFamilia,
        email: emailFamilia,
        estado: "activo",
        integrantesCount: 1,
        admins: [
          {
            id: res.userId,
            name: nombreAdmin,
            email: emailAdmin,
            status: "cambio_obligatorio",
            tempPasswordExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          }
        ]
      }

      setFamilias((prev) => [newFam, ...prev])
      setIsCreateOpen(false)
      
      // Open credentials dialog
      setResultData({
        success: true,
        tempPassword: res.tempPassword,
        invitationLink: res.invitationLink,
        emailAdmin: emailAdmin,
      })

      // Reset form
      setNombreFamilia("")
      setEmailFamilia("")
      setNombreAdmin("")
      setEmailAdmin("")
      
      toast.success("Familia y Administrador General registrados correctamente.")
    } catch (err: any) {
      toast.error(err.message || "Error al registrar la familia.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendInvite = async (userId: string) => {
    try {
      const res = await reenviarInvitacion(userId)
      
      // Update local state to refresh the expiresAt
      setFamilias((prev) =>
        prev.map((fam) => ({
          ...fam,
          admins: fam.admins.map((adm: any) =>
            adm.id === userId
              ? {
                  ...adm,
                  status: "cambio_obligatorio",
                  tempPasswordExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                }
              : adm
          ),
        }))
      )

      setResultData({
        success: true,
        tempPassword: res.tempPassword,
        invitationLink: res.invitationLink,
        emailAdmin: familias.flatMap(f => f.admins).find(a => a.id === userId)?.email || "",
      })

      toast.success("Nueva invitación generada correctamente.")
    } catch (err: any) {
      toast.error(err.message || "Error al reenviar la invitación.")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copiado al portapapeles")
  }

  return (
    <div className="space-y-8 animate-fade-in text-xs">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
            Gestión de Familias
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Administra grupos familiares e invitaciones a sus Administradores Generales
          </p>
        </div>
        <div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-2 shadow-lg shadow-indigo-600/10"
          >
            <Plus className="h-4 w-4" /> Crear Familia
          </Button>
        </div>
      </div>

      {/* Main card list */}
      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <CardTitle className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-500" />
            Grupos Familiares Registrados
          </CardTitle>
          <CardDescription className="text-xs">
            Familias e integrantes administradores asociados
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {familias.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              No hay familias registradas en el sistema. Crea una para comenzar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                    <TableHead className="text-xs font-semibold pl-6">Familia</TableHead>
                    <TableHead className="text-xs font-semibold">Correo Principal</TableHead>
                    <TableHead className="text-xs font-semibold">Administradores Generales</TableHead>
                    <TableHead className="text-xs font-semibold">Miembros</TableHead>
                    <TableHead className="text-xs font-semibold">Estado</TableHead>
                    <TableHead className="w-20 pr-6"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {familias.map((fam) => (
                    <TableRow
                      key={fam.id}
                      className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/30"
                    >
                      <TableCell className="font-extrabold text-xs py-4 pl-6 text-slate-800 dark:text-slate-200">
                        {fam.nombre}
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs py-4">
                        {fam.email}
                      </TableCell>
                      <TableCell className="py-4 space-y-1">
                        {fam.admins && fam.admins.length > 0 ? (
                          fam.admins.map((adm: any) => {
                            const isExpired =
                              adm.status === "cambio_obligatorio" &&
                              adm.tempPasswordExpiresAt &&
                              new Date(adm.tempPasswordExpiresAt) < new Date()

                            return (
                              <div key={adm.id} className="flex flex-col gap-0.5">
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                  {adm.name}
                                </span>
                                <span className="text-[10px] text-slate-400 flex items-center gap-1.5">
                                  <Mail className="h-3 w-3" /> {adm.email}
                                  {adm.status === "cambio_obligatorio" ? (
                                    <Badge
                                      variant="outline"
                                      className={`text-[9px] font-bold ${
                                        isExpired
                                          ? "border-rose-500/20 bg-rose-500/10 text-rose-500"
                                          : "border-amber-500/20 bg-amber-500/10 text-amber-500"
                                      }`}
                                    >
                                      {isExpired ? "Clave Temporal Expirada (24h)" : "Clave Temporal Activa"}
                                    </Badge>
                                  ) : (
                                    <Badge
                                      variant="outline"
                                      className="border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-[9px] font-bold"
                                    >
                                      Activo
                                    </Badge>
                                  )}
                                </span>
                              </div>
                            )
                          })
                        ) : (
                          <span className="text-slate-400 italic">Sin administrador asociado</span>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs py-4">
                        {fam.integrantesCount} integrante(s)
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge
                          variant="outline"
                          className={`text-[9px] font-bold ${
                            fam.estado === "activo"
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                              : "border-slate-250 bg-slate-100 text-slate-450"
                          }`}
                        >
                          {fam.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 pr-6 flex justify-end gap-1.5">
                        {fam.admins &&
                          fam.admins.map((adm: any) =>
                            adm.status === "cambio_obligatorio" ? (
                              <Button
                                key={adm.id}
                                variant="outline"
                                size="xs"
                                onClick={() => handleResendInvite(adm.id)}
                                className="flex items-center gap-1 border-indigo-500/25 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 font-bold"
                                title="Regenerar contraseña temporal y enviar correo"
                              >
                                <RotateCw className="h-3 w-3" /> Reenviar Inv.
                              </Button>
                            ) : null
                          )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog to Create Family */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="border-slate-200 bg-white text-slate-850 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg">Crear Nueva Familia</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Registra el grupo familiar y su respectivo Administrador General del panel financiero.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateFamily}>
            <div className="space-y-4 py-3">
              <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-xl">
                <span className="text-[10px] text-indigo-500 uppercase font-black tracking-wider block">Datos del Grupo Familiar</span>
                <div className="space-y-1">
                  <Label htmlFor="fam-name" className="text-slate-650 dark:text-slate-350 text-xs font-semibold">Nombre de la Familia *</Label>
                  <Input
                    id="fam-name"
                    placeholder="Ej: Vargas Rodríguez"
                    value={nombreFamilia}
                    onChange={(e) => setNombreFamilia(e.target.value)}
                    required
                    className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-250"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="fam-email" className="text-slate-650 dark:text-slate-350 text-xs font-semibold">Correo Principal de la Familia *</Label>
                  <Input
                    id="fam-email"
                    type="email"
                    placeholder="Ej: familia.vargas@ejemplo.cl"
                    value={emailFamilia}
                    onChange={(e) => setEmailFamilia(e.target.value)}
                    required
                    className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-250"
                  />
                </div>
              </div>

              <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-xl">
                <span className="text-[10px] text-emerald-500 uppercase font-black tracking-wider block">Administrador General Asignado</span>
                <div className="space-y-1">
                  <Label htmlFor="adm-name" className="text-slate-650 dark:text-slate-350 text-xs font-semibold">Nombre Completo del Admin *</Label>
                  <Input
                    id="adm-name"
                    placeholder="Ej: Alejandro Vargas"
                    value={nombreAdmin}
                    onChange={(e) => setNombreAdmin(e.target.value)}
                    required
                    className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-250"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="adm-email" className="text-slate-650 dark:text-slate-350 text-xs font-semibold">Correo Electrónico de Acceso *</Label>
                  <Input
                    id="adm-email"
                    type="email"
                    placeholder="Ej: usuario@ejemplo.cl"
                    value={emailAdmin}
                    onChange={(e) => setEmailAdmin(e.target.value)}
                    required
                    className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-250"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="mt-2">
              <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
                {isSubmitting ? "Registrando..." : "Crear Familia y Enviar Inv."}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Result Dialog showing credentials for easy testing */}
      <Dialog open={resultData !== null} onOpenChange={(open) => { if (!open) setResultData(null) }}>
        <DialogContent className="border-slate-250 bg-white text-slate-850 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg text-emerald-500 flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              Invitación Generada Exitosamente
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              La invitación ha sido simulada correctamente. Utiliza estas credenciales temporales para probar el primer inicio de sesión.
            </DialogDescription>
          </DialogHeader>

          {resultData && (
            <div className="space-y-4 py-3">
              <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Correo Administrador</span>
                  <div className="flex justify-between items-center mt-1">
                    <strong className="text-xs text-slate-850 dark:text-slate-200">{resultData.emailAdmin}</strong>
                    <Button variant="ghost" size="icon-xs" onClick={() => copyToClipboard(resultData.emailAdmin || "")} className="text-slate-400 hover:text-indigo-500">
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-200/50 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block">Contraseña Temporal (Expira en 24 Horas)</span>
                  <div className="flex justify-between items-center mt-1">
                    <strong className="text-xs text-rose-500 font-mono select-all tracking-wider">{resultData.tempPassword}</strong>
                    <Button variant="ghost" size="icon-xs" onClick={() => copyToClipboard(resultData.tempPassword || "")} className="text-slate-400 hover:text-indigo-500">
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-200/50 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block">Enlace de Activación</span>
                  <div className="flex justify-between items-center mt-1 gap-2">
                    <span className="text-[10px] text-slate-500 font-mono truncate max-w-[280px]">{resultData.invitationLink}</span>
                    <Button variant="ghost" size="icon-xs" onClick={() => copyToClipboard(resultData.invitationLink || "")} className="text-slate-400 hover:text-indigo-500 shrink-0">
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] text-amber-600 dark:text-amber-400 flex items-start gap-2 leading-normal">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Importante para pruebas:</strong> Copia la contraseña temporal y abre una pestaña de incógnito (o cierra tu sesión actual), haz clic en el enlace de activación o inicia sesión con este correo y clave temporal para completar el cambio obligatorio de contraseña.
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setResultData(null)} className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 font-bold">
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
