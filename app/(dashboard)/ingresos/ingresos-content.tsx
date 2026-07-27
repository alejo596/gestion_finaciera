"use client"

import * as React from "react"
import { useState } from "react"
import { formatCLP, formatDate } from "@/lib/format"
import { createIngreso, deleteIngreso } from "@/lib/actions"
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
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Plus, Trash2, ArrowUpRight, Check, X } from "lucide-react"

type IngresosContentProps = {
  initialIngresos: any[]
}

export function IngresosContent({ initialIngresos }: IngresosContentProps) {
  const [ingresos, setIngresos] = useState(initialIngresos)
  const [isIncomeOpen, setIsIncomeOpen] = useState(false)

  // Form states
  const [incomeDesc, setIncomeDesc] = useState("")
  const [incomeMonto, setIncomeMonto] = useState("")
  const [incomeFecha, setIncomeFecha] = useState(
    new Date().toISOString().substring(0, 10)
  )
  const [incomeFuente, setIncomeFuente] = useState("")
  const [incomeRecurrente, setIncomeRecurrente] = useState(false)
  const [isSubmittingIncome, setIsSubmittingIncome] = useState(false)

  // Search query
  const [searchQuery, setSearchQuery] = useState("")

  const filteredIngresos = ingresos.filter((i) => {
    const matchesSearch =
      i.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.fuente && i.fuente.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesSearch
  })

  // Submit handers
  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!incomeDesc || !incomeMonto || !incomeFecha) {
      toast.error("Por favor completa los campos requeridos")
      return
    }

    setIsSubmittingIncome(true)
    try {
      const newI = await createIngreso({
        descripcion: incomeDesc,
        monto: Number(incomeMonto),
        fecha: incomeFecha,
        fuente: incomeFuente,
        recurrente: incomeRecurrente,
      })

      setIngresos((prev) => [newI, ...prev])
      setIsIncomeOpen(false)
      // reset
      setIncomeDesc("")
      setIncomeMonto("")
      setIncomeFuente("")
      setIncomeRecurrente(false)
      toast.success("Ingreso registrado correctamente")
    } catch (err: any) {
      toast.error(err.message || "Error al registrar el ingreso")
    } finally {
      setIsSubmittingIncome(false)
    }
  }

  const handleDeleteIncome = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este ingreso?")) return

    try {
      await deleteIngreso(id)
      setIngresos((prev) => prev.filter((i) => i.id !== id))
      toast.success("Ingreso eliminado correctamente")
    } catch (err: any) {
      toast.error("Error al eliminar el ingreso")
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Ingresos del Hogar
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Registra y haz seguimiento de los ingresos, sueldos y aportes familiares
          </p>
        </div>
        <div>
          <Button
            onClick={() => setIsIncomeOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-2 shadow-lg shadow-emerald-600/10"
          >
            <Plus className="h-4 w-4" /> Registrar Ingreso
          </Button>
        </div>
      </div>

      {/* Income List Card */}
      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <CardTitle className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <ArrowUpRight className="h-5 w-5 text-emerald-500" />
            Flujo de Ingresos
          </CardTitle>
          <CardDescription className="text-xs">
            Ingresos familiares ordenados por fecha
          </CardDescription>

          {/* Filter Tools */}
          <div className="mt-4 flex max-w-sm">
            <Input
              placeholder="Buscar por descripción o fuente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredIngresos.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              No se encontraron ingresos registrados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                    <TableHead className="text-xs font-semibold pl-6">Descripción</TableHead>
                    <TableHead className="text-xs font-semibold">Fuente / Empleador</TableHead>
                    <TableHead className="text-xs font-semibold">Fecha</TableHead>
                    <TableHead className="text-xs font-semibold">Recurrente</TableHead>
                    <TableHead className="text-right text-xs font-semibold">Monto</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIngresos.map((i) => (
                    <TableRow
                      key={i.id}
                      className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/30"
                    >
                      <TableCell className="font-semibold text-xs py-4 pl-6 text-slate-800 dark:text-slate-200">
                        {i.descripcion}
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs py-4">
                        {i.fuente || <span className="text-slate-400 italic">No especificado</span>}
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs py-4">
                        {formatDate(i.fecha)}
                      </TableCell>
                      <TableCell className="py-4">
                        {i.recurrente ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] font-semibold border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 w-fit"
                          >
                            <Check className="h-3 w-3" /> Sí
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] font-semibold border-slate-200 dark:border-slate-800 text-slate-400 flex items-center gap-1 w-fit"
                          >
                            <X className="h-3 w-3" /> No
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-bold text-xs py-4 text-emerald-600 dark:text-emerald-400">
                        {formatCLP(i.monto)}
                      </TableCell>
                      <TableCell className="pr-6 py-4">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDeleteIncome(i.id)}
                          className="text-slate-400 hover:text-rose-500 transition-colors"
                          title="Eliminar ingreso"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Income Dialog Modal */}
      <Dialog open={isIncomeOpen} onOpenChange={setIsIncomeOpen}>
        <DialogContent className="border-slate-200 bg-white text-slate-850 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg">Registrar Nuevo Ingreso</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Ingresa los detalles para registrar un ingreso al hogar.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddIncome}>
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="dlg-inc-desc" className="text-slate-600 dark:text-slate-300 text-xs font-semibold">Descripción *</Label>
                <Input
                  id="dlg-inc-desc"
                  placeholder="Ej: Sueldo mensual, Venta informal"
                  value={incomeDesc}
                  onChange={(e) => setIncomeDesc(e.target.value)}
                  required
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="dlg-inc-monto" className="text-slate-600 dark:text-slate-300 text-xs font-semibold">Monto (CLP) *</Label>
                  <Input
                    id="dlg-inc-monto"
                    type="number"
                    placeholder="Ej: 800000"
                    value={incomeMonto}
                    onChange={(e) => setIncomeMonto(e.target.value)}
                    required
                    className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dlg-inc-fecha" className="text-slate-600 dark:text-slate-300 text-xs font-semibold">Fecha *</Label>
                  <Input
                    id="dlg-inc-fecha"
                    type="date"
                    value={incomeFecha}
                    onChange={(e) => setIncomeFecha(e.target.value)}
                    required
                    className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-end">
                <div className="space-y-1">
                  <Label htmlFor="dlg-inc-fuente" className="text-slate-600 dark:text-slate-300 text-xs font-semibold">Fuente / Empleador</Label>
                  <Input
                    id="dlg-inc-fuente"
                    placeholder="Ej: Empresa X, Particular"
                    value={incomeFuente}
                    onChange={(e) => setIncomeFuente(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div className="flex items-center gap-2 h-10 px-1">
                  <input
                    id="dlg-inc-recurrente"
                    type="checkbox"
                    checked={incomeRecurrente}
                    onChange={(e) => setIncomeRecurrente(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4 bg-slate-50 dark:bg-slate-950 dark:border-slate-800"
                  />
                  <Label htmlFor="dlg-inc-recurrente" className="text-slate-600 dark:text-slate-300 text-xs cursor-pointer select-none">
                    ¿Es un ingreso recurrente?
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsIncomeOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmittingIncome} className="bg-emerald-600 text-white hover:bg-emerald-500">
                {isSubmittingIncome ? "Guardando..." : "Registrar Ingreso"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
