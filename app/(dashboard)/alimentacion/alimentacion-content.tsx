"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatCLP, formatDate, MESES } from "@/lib/format"
import {
  setPresupuestoAlimentacion,
  createGastoAlimentacion,
  deleteGastoAlimentacion,
} from "@/lib/actions"
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
import { Progress } from "@/components/ui/progress"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { Plus, Trash2, Utensils, Calendar, Store, Edit2, AlertTriangle, Info, Clock, AlertCircle } from "lucide-react"

type AlimentacionContentProps = {
  anio: number
  mes: number
  initialPresupuesto: any
  initialGastos: any[]
}

const CATEGORIAS_ALIMENTACION = [
  "Supermercado",
  "Feria",
  "Almacén / Minimarket",
  "Panadería / Pastelería",
  "Carnicería / Pescadería",
  "Comida Rápida / Delivery",
  "Otros",
]

export function AlimentacionContent({
  anio,
  mes,
  initialPresupuesto,
  initialGastos,
}: AlimentacionContentProps) {
  const router = useRouter()
  const [gastos, setGastos] = useState(initialGastos)
  const [presupuesto, setPresupuesto] = useState(initialPresupuesto)

  // Dialog states
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false)
  const [isBudgetOpen, setIsBudgetOpen] = useState(false)

  // Purchase Form
  const [purchaseDesc, setPurchaseDesc] = useState("")
  const [purchaseMonto, setPurchaseMonto] = useState("")
  const [purchaseLugar, setPurchaseLugar] = useState("")
  const [purchaseCat, setPurchaseCat] = useState("Supermercado")
  const [purchaseFecha, setPurchaseFecha] = useState(
    new Date().toISOString().substring(0, 10)
  )
  const [isSubmittingPurchase, setIsSubmittingPurchase] = useState(false)

  // Budget Form (Enhanced with Dates)
  const [budgetMonto, setBudgetMonto] = useState(
    presupuesto ? String(presupuesto.montoPresupuestado) : ""
  )
  const defaultFechaInicio = `${anio}-${String(mes).padStart(2, "0")}-01`
  const defaultFechaRenovacion = new Date(anio, mes, 0).toISOString().substring(0, 10)
  
  const [budgetFechaInicio, setBudgetFechaInicio] = useState(
    presupuesto?.fechaInicio || defaultFechaInicio
  )
  const [budgetFechaRenovacion, setBudgetFechaRenovacion] = useState(
    presupuesto?.fechaRenovacion || defaultFechaRenovacion
  )
  const [isSubmittingBudget, setIsSubmittingBudget] = useState(false)

  // Años para el selector
  const currentYear = new Date().getFullYear()
  const listAnios = [currentYear - 1, currentYear, currentYear + 1]

  const handleMonthChange = (newMes: string) => {
    router.push(`/hogar/alimentacion?anio=${anio}&mes=${newMes}`)
  }

  const handleYearChange = (newAnio: string) => {
    router.push(`/hogar/alimentacion?anio=${newAnio}&mes=${mes}`)
  }

  // --- CALCULATION LOGIC ---
  const totalGastado = gastos.reduce((sum, g) => sum + g.monto, 0)
  const montoPresupuestado = presupuesto?.montoPresupuestado ?? 0
  const saldoRestante = montoPresupuestado - totalGastado
  const porcentajeConsumido =
    montoPresupuestado > 0 ? Math.round((totalGastado / montoPresupuestado) * 100) : 0

  // Fechas y cálculos de días
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dateInicio = new Date(presupuesto?.fechaInicio || defaultFechaInicio)
  dateInicio.setHours(0, 0, 0, 0)
  
  const dateRenovacion = new Date(presupuesto?.fechaRenovacion || defaultFechaRenovacion)
  dateRenovacion.setHours(0, 0, 0, 0)

  // Días transcurridos
  const diffTimeTranscurridos = today.getTime() - dateInicio.getTime()
  const diasTranscurridos = Math.max(1, Math.ceil(diffTimeTranscurridos / (1000 * 60 * 60 * 24)))

  // Días restantes
  const diffTimeRestantes = dateRenovacion.getTime() - today.getTime()
  const diasRestantes = Math.max(0, Math.ceil(diffTimeRestantes / (1000 * 60 * 60 * 24)))

  const totalDiasPeriodo = Math.max(1, diasTranscurridos + diasRestantes)

  // Promedio diario actual y presupuesto recomendado
  const promedioGastoDiario = Math.round(totalGastado / diasTranscurridos)
  const presupuestoRecomendadoDiario = diasRestantes > 0 ? Math.round(Math.max(0, saldoRestante) / diasRestantes) : 0
  
  // Proyección de gasto mensual
  const proyeccionGastoTotal = promedioGastoDiario * totalDiasPeriodo

  // Alertas
  const alertGastoExcesivoDiario = montoPresupuestado > 0 && promedioGastoDiario > (montoPresupuestado / totalDiasPeriodo)
  const alertRiesgoSuperarMensual = montoPresupuestado > 0 && proyeccionGastoTotal > montoPresupuestado

  // Save Budget
  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!budgetMonto || Number(budgetMonto) < 0) {
      toast.error("Por favor ingresa un monto válido")
      return
    }
    if (!budgetFechaInicio || !budgetFechaRenovacion) {
      toast.error("Fechas de inicio y renovación son obligatorias")
      return
    }

    setIsSubmittingBudget(true)
    try {
      const updated = await setPresupuestoAlimentacion({
        anio,
        mes,
        montoPresupuestado: Number(budgetMonto),
        fechaInicio: budgetFechaInicio,
        fechaRenovacion: budgetFechaRenovacion,
      })
      setPresupuesto(updated)
      setIsBudgetOpen(false)
      toast.success("Presupuesto de alimentación guardado")
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Error al configurar el presupuesto")
    } finally {
      setIsSubmittingBudget(false)
    }
  }

  // Save Purchase
  const handleSavePurchase = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!purchaseDesc || !purchaseMonto || !purchaseFecha) {
      toast.error("Por favor completa los campos requeridos")
      return
    }

    setIsSubmittingPurchase(true)
    try {
      const newPurchase = await createGastoAlimentacion({
        descripcion: purchaseDesc,
        monto: Number(purchaseMonto),
        categoria: purchaseCat,
        lugar: purchaseLugar,
        fecha: purchaseFecha,
      })

      setGastos((prev) => [newPurchase, ...prev])
      setIsPurchaseOpen(false)
      setPurchaseDesc("")
      setPurchaseMonto("")
      setPurchaseLugar("")
      setPurchaseCat("Supermercado")
      toast.success("Compra registrada")
      router.refresh()
    } catch (err: any) {
      toast.error("Error al registrar la compra")
    } finally {
      setIsSubmittingPurchase(false)
    }
  }

  // Delete Purchase
  const handleDeletePurchase = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este registro de compra?")) return

    try {
      await deleteGastoAlimentacion(id)
      setGastos((prev) => prev.filter((g) => g.id !== id))
      toast.success("Compra eliminada correctamente")
      router.refresh()
    } catch (err: any) {
      toast.error("Error al eliminar el registro")
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header & Date Pickers */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Alimentación Familiar
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Control de alimentación con calendarios de renovación, proyecciones y alertas diarias.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <Calendar className="h-4 w-4 text-slate-400 ml-2" />
            <Select value={String(mes)} onValueChange={handleMonthChange}>
              <SelectTrigger className="border-0 bg-transparent h-8 w-[120px] focus:ring-0 focus:ring-offset-0 text-xs">
                <SelectValue placeholder="Mes" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                {MESES.map((nombre, idx) => (
                  <SelectItem key={idx + 1} value={String(idx + 1)}>
                    {nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={String(anio)} onValueChange={handleYearChange}>
              <SelectTrigger className="border-0 bg-transparent h-8 w-[90px] focus:ring-0 focus:ring-offset-0 text-xs">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                {listAnios.map((a) => (
                  <SelectItem key={a} value={String(a)}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => setIsPurchaseOpen(true)}
            disabled={montoPresupuestado === 0}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Registrar Compra
          </Button>
        </div>
      </div>

      {/* Alertas Inteligentes */}
      {montoPresupuestado > 0 && (
        <div className="space-y-3">
          {alertGastoExcesivoDiario && (
            <div className="flex items-center gap-3 p-4 text-sm rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <div>
                <strong className="font-bold">¡Gasto diario por sobre lo recomendado!</strong> Tu promedio diario actual ({formatCLP(promedioGastoDiario)}) supera el límite diario recomendado para este periodo ({formatCLP(Math.round(montoPresupuestado / totalDiasPeriodo))}).
              </div>
            </div>
          )}
          {alertRiesgoSuperarMensual && (
            <div className="flex items-center gap-3 p-4 text-sm rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div>
                <strong className="font-bold">¡Riesgo de superar el presupuesto!</strong> De mantener tu ritmo de consumo, proyectamos un gasto final de <strong className="underline">{formatCLP(proyeccionGastoTotal)}</strong>, superando el presupuesto fijado de {formatCLP(montoPresupuestado)}.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Budget Summary Card & Progress */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Budget Card */}
        <Card className="md:col-span-2 border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-900/60 backdrop-blur-sm shadow-sm transition-all duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Utensils className="h-5 w-5 text-amber-500" />
                Estado del Presupuesto
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsBudgetOpen(true)}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5"
              >
                <Edit2 className="h-3.5 w-3.5" />
                {montoPresupuestado > 0 ? "Modificar" : "Configurar"}
              </Button>
            </div>
            <CardDescription className="text-xs">
              Periodo: {presupuesto ? `${formatDate(presupuesto.fechaInicio)} al ${formatDate(presupuesto.fechaRenovacion)}` : `Mes de ${MESES[mes - 1]}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            {montoPresupuestado === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <AlertTriangle className="h-10 w-10 text-amber-500 mb-2 animate-bounce" />
                <h4 className="font-bold text-sm">Sin presupuesto establecido</h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
                  Establece un presupuesto mensual de alimentación definiendo las fechas de inicio y renovación del periodo.
                </p>
                <Button
                  onClick={() => setIsBudgetOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  Configurar Presupuesto
                </Button>
              </div>
            ) : (
              <>
                <div className="grid gap-4 grid-cols-3 text-center">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Presupuestado</span>
                    <span className="text-base font-bold text-slate-800 dark:text-white">{formatCLP(montoPresupuestado)}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Gastado</span>
                    <span className={`text-base font-bold ${porcentajeConsumido >= 100 ? "text-rose-500" : "text-slate-800 dark:text-white"}`}>{formatCLP(totalGastado)}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Disponible</span>
                    <span className={`text-base font-bold ${saldoRestante >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                      {formatCLP(saldoRestante)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Progreso del presupuesto</span>
                    <Badge variant="outline" className={`text-[10px] font-bold border-0 ${porcentajeConsumido >= 100 ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                      {porcentajeConsumido}% consumido
                    </Badge>
                  </div>
                  <Progress
                    value={Math.min(porcentajeConsumido, 100)}
                    className="h-3"
                    indicatorClassName={porcentajeConsumido >= 100 ? "bg-rose-500" : "bg-emerald-500"}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Calendar and averages details card */}
        <Card className="border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-900/60 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <CardTitle className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-500" />
              Métricas de Periodo
            </CardTitle>
            <CardDescription className="text-xs">Calendario e indicadores diarios</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 flex-1 flex flex-col justify-between text-xs space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-50 dark:border-slate-800/60">
              <span className="text-slate-400">Días transcurridos</span>
              <strong className="text-slate-700 dark:text-slate-200">{diasTranscurridos} d</strong>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-50 dark:border-slate-800/60">
              <span className="text-slate-400">Días restantes</span>
              <strong className="text-slate-700 dark:text-slate-200 font-extrabold">{diasRestantes} d</strong>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-50 dark:border-slate-800/60">
              <span className="text-slate-400">Gasto Promedio Diario</span>
              <strong className="text-slate-700 dark:text-slate-200">{formatCLP(promedioGastoDiario)}</strong>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-50 dark:border-slate-800/60">
              <span className="text-slate-400">Recomendado Diario</span>
              <strong className="text-emerald-500 font-extrabold">{formatCLP(presupuestoRecomendadoDiario)}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Proyección Gasto Total</span>
              <strong className={`font-black ${proyeccionGastoTotal > montoPresupuestado ? "text-rose-500" : "text-indigo-500"}`}>
                {formatCLP(proyeccionGastoTotal)}
              </strong>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchases History */}
      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <CardTitle className="text-base font-bold text-slate-800 dark:text-white">
            Compras de Alimentación
          </CardTitle>
          <CardDescription className="text-xs">
            Detalle de gastos realizados en este mes
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {gastos.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              No hay compras registradas en este mes.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                    <TableHead className="text-xs font-semibold pl-6">Descripción</TableHead>
                    <TableHead className="text-xs font-semibold">Tipo</TableHead>
                    <TableHead className="text-xs font-semibold">Lugar</TableHead>
                    <TableHead className="text-xs font-semibold">Fecha</TableHead>
                    <TableHead className="text-right text-xs font-semibold">Monto</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gastos.map((g) => (
                    <TableRow
                      key={g.id}
                      className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/30"
                    >
                      <TableCell className="font-semibold text-xs py-4 pl-6 text-slate-800 dark:text-slate-200">
                        {g.descripcion}
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge
                          variant="outline"
                          className="text-[10px] font-semibold border-slate-200 dark:border-slate-800"
                        >
                          {g.categoria}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs py-4">
                        {g.lugar || <span className="text-slate-400 italic">No especificado</span>}
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs py-4">
                        {formatDate(g.fecha)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-xs py-4 text-rose-500">
                        {formatCLP(g.monto)}
                      </TableCell>
                      <TableCell className="pr-6 py-4">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDeletePurchase(g.id)}
                          className="text-slate-400 hover:text-rose-500 transition-colors"
                          title="Eliminar registro"
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

      {/* Budget Modal */}
      <Dialog open={isBudgetOpen} onOpenChange={setIsBudgetOpen}>
        <DialogContent className="border-slate-200 bg-white text-slate-850 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg">Configurar Presupuesto de Alimentación</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Establece el monto del presupuesto y las fechas de vigencia del periodo de alimentación.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveBudget}>
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="budget-amount" className="text-slate-600 dark:text-slate-300 text-xs font-semibold">Monto del Presupuesto (CLP) *</Label>
                <Input
                  id="budget-amount"
                  type="number"
                  placeholder="Ej: 350000"
                  value={budgetMonto}
                  onChange={(e) => setBudgetMonto(e.target.value)}
                  required
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="budget-start" className="text-slate-600 dark:text-slate-300 text-xs font-semibold">Fecha Inicio Periodo *</Label>
                  <Input
                    id="budget-start"
                    type="date"
                    value={budgetFechaInicio}
                    onChange={(e) => setBudgetFechaInicio(e.target.value)}
                    required
                    className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="budget-end" className="text-slate-600 dark:text-slate-300 text-xs font-semibold">Fecha Pago / Renovación *</Label>
                  <Input
                    id="budget-end"
                    type="date"
                    value={budgetFechaRenovacion}
                    onChange={(e) => setBudgetFechaRenovacion(e.target.value)}
                    required
                    className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsBudgetOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmittingBudget} className="bg-emerald-600 text-white hover:bg-emerald-500">
                {isSubmittingBudget ? "Guardando..." : "Guardar Presupuesto"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Purchase Modal */}
      <Dialog open={isPurchaseOpen} onOpenChange={setIsPurchaseOpen}>
        <DialogContent className="border-slate-200 bg-white text-slate-850 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg">Registrar Compra de Alimentación</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Ingresa los detalles de la compra de supermercado o comida.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSavePurchase}>
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="pur-desc" className="text-slate-600 dark:text-slate-300 text-xs font-semibold">Descripción *</Label>
                <Input
                  id="pur-desc"
                  placeholder="Ej: Compra semanal, Feria verduras"
                  value={purchaseDesc}
                  onChange={(e) => setPurchaseDesc(e.target.value)}
                  required
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="pur-monto" className="text-slate-600 dark:text-slate-300 text-xs font-semibold">Monto (CLP) *</Label>
                  <Input
                    id="pur-monto"
                    type="number"
                    placeholder="Ej: 45000"
                    value={purchaseMonto}
                    onChange={(e) => setPurchaseMonto(e.target.value)}
                    required
                    className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="pur-fecha" className="text-slate-600 dark:text-slate-300 text-xs font-semibold">Fecha *</Label>
                  <Input
                    id="pur-fecha"
                    type="date"
                    value={purchaseFecha}
                    onChange={(e) => setPurchaseFecha(e.target.value)}
                    required
                    className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="pur-lugar" className="text-slate-600 dark:text-slate-300 text-xs font-semibold">Lugar / Establecimiento</Label>
                  <Input
                    id="pur-lugar"
                    placeholder="Ej: Supermercado Líder, Feria local"
                    value={purchaseLugar}
                    onChange={(e) => setPurchaseLugar(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="pur-cat" className="text-slate-600 dark:text-slate-300 text-xs font-semibold">Categoría de Compra</Label>
                  <Select value={purchaseCat} onValueChange={setPurchaseCat}>
                    <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                      {CATEGORIAS_ALIMENTACION.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsPurchaseOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmittingPurchase} className="bg-emerald-600 text-white hover:bg-emerald-500">
                {isSubmittingPurchase ? "Guardando..." : "Registrar Compra"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
