"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createDepartamento } from "@/lib/actions-condo"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { Plus, Building } from "lucide-react"

type DeptsContentProps = {
  initialDepts: any[]
  copropietarios: any[]
}

export function DeptsContent({ initialDepts, copropietarios }: DeptsContentProps) {
  const router = useRouter()
  const [depts, setDepts] = useState(initialDepts)
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form states
  const [numero, setNumero] = useState("")
  const [bloque, setBloque] = useState("")
  const [copropietarioId, setCopropietarioId] = useState("")
  const [prorrateoPercent, setProrrateoPercent] = useState("") // Float input (e.g. 2.5)

  const handleOpenCreate = () => {
    setNumero("")
    setBloque("")
    setCopropietarioId(copropietarios.length > 0 ? copropietarios[0].id : "")
    setProrrateoPercent("1.00")
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!numero.trim()) {
      toast.error("El número de departamento es obligatorio")
      return
    }

    // Convert float percent (e.g. 2.50) to integer centésimas (250)
    const prorrateo = Math.round(Number(prorrateoPercent) * 100)
    if (isNaN(prorrateo) || prorrateo <= 0) {
      toast.error("Ingresa un porcentaje de copropiedad (prorrateo) válido")
      return
    }

    setIsSubmitting(true)
    try {
      const newDept = await createDepartamento({
        numero: numero.trim(),
        bloque: bloque.trim() || undefined,
        copropietarioId: copropietarioId || undefined,
        prorrateo,
      })

      toast.success("Departamento registrado con éxito")
      setIsOpen(false)
      router.refresh()
      window.location.reload() // Force layout reload
    } catch (err: any) {
      toast.error(err.message || "Error al registrar el departamento")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
            Directorio de Departamentos
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Administra las unidades habitacionales y asigna copropietarios responsables
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> Agregar Unidad
        </Button>
      </div>

      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <CardTitle className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Building className="h-5 w-5 text-indigo-500" />
            Departamentos y Unidades
          </CardTitle>
          <CardDescription className="text-xs">
            Resumen de copropietarios asignados y cuotas de prorrateo
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {depts.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              No hay departamentos registrados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                    <TableHead className="text-xs font-semibold pl-6">Torre / Bloque</TableHead>
                    <TableHead className="text-xs font-semibold">N° Departamento</TableHead>
                    <TableHead className="text-xs font-semibold">Copropietario Asignado</TableHead>
                    <TableHead className="text-xs font-semibold">Correo Electrónico</TableHead>
                    <TableHead className="text-xs font-semibold">Alícuota / Prorrateo</TableHead>
                    <TableHead className="text-xs font-semibold pr-6">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {depts.map((d) => (
                    <TableRow
                      key={d.id}
                      className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/30"
                    >
                      <TableCell className="font-semibold text-xs py-4 pl-6 text-slate-800 dark:text-slate-200">
                        {d.bloque || <span className="text-slate-400 italic">No especificado</span>}
                      </TableCell>
                      <TableCell className="font-extrabold text-xs py-4 text-indigo-500">
                        N° {d.numero}
                      </TableCell>
                      <TableCell className="font-semibold text-xs py-4 text-slate-700 dark:text-slate-300">
                        {d.copropietarioNombre || <span className="text-rose-500 italic">Sin asignar</span>}
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs py-4">
                        {d.copropietarioEmail || "-"}
                      </TableCell>
                      <TableCell className="font-bold text-xs py-4 text-slate-800 dark:text-slate-250">
                        {(d.prorrateo / 100).toFixed(2)} %
                      </TableCell>
                      <TableCell className="pr-6 py-4">
                        <Badge
                          variant="outline"
                          className="text-[9px] font-bold border-0 bg-emerald-500/10 text-emerald-500"
                        >
                          activo
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CREATE DIALOG */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="border-slate-200 bg-white text-slate-850 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg">Agregar Departamento</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Registra una unidad habitacional y su porcentaje de alícuota para cobros.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="dep-num" className="font-semibold">N° Departamento *</Label>
                  <Input
                    id="dep-num"
                    placeholder="Ej: 101, 1404"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    required
                    className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dep-blo" className="font-semibold">Bloque / Torre</Label>
                  <Input
                    id="dep-blo"
                    placeholder="Ej: Torre A, Bloque 2"
                    value={bloque}
                    onChange={(e) => setBloque(e.target.value)}
                    className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="dep-cop" className="font-semibold">Copropietario Responsable</Label>
                  <select
                    id="dep-cop"
                    value={copropietarioId}
                    onChange={(e) => setCopropietarioId(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                  >
                    <option value="">Seleccionar Copropietario</option>
                    {copropietarios.map((cop) => (
                      <option key={cop.id} value={cop.id}>
                        {cop.name} ({cop.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dep-pro" className="font-semibold">Prorrateo / Alícuota % *</Label>
                  <Input
                    id="dep-pro"
                    type="number"
                    step="0.01"
                    placeholder="Ej: 2.50"
                    value={prorrateoPercent}
                    onChange={(e) => setProrrateoPercent(e.target.value)}
                    required
                    className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
                {isSubmitting ? "Registrando..." : "Registrar Unidad"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
