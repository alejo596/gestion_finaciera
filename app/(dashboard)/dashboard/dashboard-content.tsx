"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { formatCLP, formatCLPCompact, formatDate } from "@/lib/format"
import { createGasto, createIngreso } from "@/lib/actions"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Utensils,
  Plus,
  ArrowRight,
  TrendingUp,
  Percent,
} from "lucide-react"

// Recharts components directly (we can style them via classes or inline config)
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts"

type DashboardContentProps = {
  user: { name: string; email: string; role: string }
  initialIngresos: any[]
  initialGastos: any[]
  initialCategorias: any[]
  presupuestoAlimentacion: any
  gastosAlimentacion: any[]
}

export function DashboardContent({
  user,
  initialIngresos,
  initialGastos,
  initialCategorias,
  presupuestoAlimentacion,
  gastosAlimentacion,
}: DashboardContentProps) {
  const [ingresos, setIngresos] = useState(initialIngresos)
  const [gastos, setGastos] = useState(initialGastos.map((g) => ({ ...g, fecha: g.fecha || g.fechaInicio })))
  const [isExpenseOpen, setIsExpenseOpen] = useState(false)
  const [isIncomeOpen, setIsIncomeOpen] = useState(false)

  // Form states
  const [expenseDesc, setExpenseDesc] = useState("")
  const [expenseMonto, setExpenseMonto] = useState("")
  const [expenseFecha, setExpenseFecha] = useState(new Date().toISOString().substring(0, 10))
  const [expenseCategoria, setExpenseCategoria] = useState("null")
  const [expenseMetodo, setExpenseMetodo] = useState("Efectivo")
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false)

  const [incomeDesc, setIncomeDesc] = useState("")
  const [incomeMonto, setIncomeMonto] = useState("")
  const [incomeFecha, setIncomeFecha] = useState(new Date().toISOString().substring(0, 10))
  const [incomeFuente, setIncomeFuente] = useState("")
  const [incomeRecurrente, setIncomeRecurrente] = useState(false)
  const [isSubmittingIncome, setIsSubmittingIncome] = useState(false)

  // Current month variables
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const currentMonthPrefix = `${currentYear}-${String(currentMonth).padStart(2, "0")}`

  // Calculations
  const ingresosEsteMes = ingresos.filter((i) => i.fecha.startsWith(currentMonthPrefix))
  const gastosEsteMes = gastos.filter((g) => g.fecha.startsWith(currentMonthPrefix))

  const totalIngresosEsteMes = ingresosEsteMes.reduce((sum, i) => sum + i.monto, 0)
  const totalGastosEsteMes = gastosEsteMes.reduce((sum, g) => sum + g.monto, 0)
  const balanceEsteMes = totalIngresosEsteMes - totalGastosEsteMes

  // Lifetime summaries
  const totalIngresosTotal = ingresos.reduce((sum, i) => sum + i.monto, 0)
  const totalGastosTotal = gastos.reduce((sum, g) => sum + g.monto, 0)
  const balanceTotal = totalIngresosTotal - totalGastosTotal

  // Food Budget
  const totalAlimentacion = gastosAlimentacion.reduce((sum, g) => sum + g.monto, 0)
  const montoPresupuestado = presupuestoAlimentacion?.montoPresupuestado ?? 0
  const porcentajeAlimentacion =
    montoPresupuestado > 0 ? Math.round((totalAlimentacion / montoPresupuestado) * 100) : 0

  // 1. Group expenses by category for current month
  const categoryMap: Record<string, { monto: number; color: string }> = {}
  gastosEsteMes.forEach((g) => {
    const cat = initialCategorias.find((c) => c.id === g.categoriaId)
    const name = cat ? cat.nombre : "Sin Categoría"
    const color = cat ? cat.color : "#64748b"
    if (!categoryMap[name]) {
      categoryMap[name] = { monto: 0, color }
    }
    categoryMap[name].monto += g.monto
  })

  const expensesByCategoryData = Object.entries(categoryMap).map(([name, val]) => ({
    name,
    value: val.monto,
    color: val.color,
  }))

  // 2. Multi-month cashflow history (last 6 months)
  const ultimosMeses = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = d.toLocaleDateString("es-CL", { month: "short", year: "2-digit" })
    const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    ultimosMeses.push({
      label,
      prefix,
      Ingresos: 0,
      Gastos: 0,
    })
  }

  ingresos.forEach((ing) => {
    const mesPref = ing.fecha.substring(0, 7)
    const mesObj = ultimosMeses.find((m) => m.prefix === mesPref)
    if (mesObj) mesObj.Ingresos += ing.monto
  })

  gastos.forEach((gst) => {
    const mesPref = gst.fecha.substring(0, 7)
    const mesObj = ultimosMeses.find((m) => m.prefix === mesPref)
    if (mesObj) mesObj.Gastos += gst.monto
  })

  // 3. Combined transactions
  const combinedTransactions = [
    ...ingresos.map((i) => ({ ...i, type: "income" })),
    ...gastos.map((g) => ({ ...g, type: "expense" })),
  ]
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 5)

  // Submit handlers
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!expenseDesc || !expenseMonto || !expenseFecha) {
      toast.error("Por favor completa los campos requeridos")
      return
    }

    setIsSubmittingExpense(true)
    try {
      const newG = await createGasto({
        descripcion: expenseDesc,
        monto: Number(expenseMonto),
        fecha: expenseFecha,
        categoriaId: expenseCategoria === "null" ? null : Number(expenseCategoria),
        metodoPago: expenseMetodo,
      })

      setGastos((prev) => [newG, ...prev])
      setIsExpenseOpen(false)
      // reset
      setExpenseDesc("")
      setExpenseMonto("")
      setExpenseCategoria("null")
      setExpenseMetodo("Efectivo")
      toast.success("Gasto registrado correctamente")
    } catch (err: any) {
      toast.error(err.message || "Error al guardar el gasto")
    } finally {
      setIsSubmittingExpense(false)
    }
  }

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
      toast.error(err.message || "Error al guardar el ingreso")
    } finally {
      setIsSubmittingIncome(false)
    }
  }

  // Circular gauge color helper
  const getProgressColor = (percent: number) => {
    if (percent < 80) return "bg-emerald-500"
    if (percent < 100) return "bg-amber-500"
    return "bg-rose-500 animate-pulse"
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Panel Financiero
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Resumen de las finanzas familiares de {user.name} ({user.role})
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setIsIncomeOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Ingreso
          </Button>
          <Button
            onClick={() => setIsExpenseOpen(true)}
            className="bg-rose-600 hover:bg-rose-500 text-white font-medium flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Gasto
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Balance Card */}
        <Card className="border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-900/60 backdrop-blur-sm shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Balance Este Mes
            </CardTitle>
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${balanceEsteMes >= 0
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-500/10"
              : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-500/10"
              }`}>
              <Wallet className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
              {formatCLP(balanceEsteMes)}
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              Balance general: <span className="font-semibold text-slate-600 dark:text-slate-300">{formatCLP(balanceTotal)}</span>
            </p>
          </CardContent>
        </Card>

        {/* Ingresos Card */}
        <Card className="border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-900/60 backdrop-blur-sm shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Ingresos de este Mes
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
              {formatCLP(totalIngresosEsteMes)}
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              {ingresosEsteMes.length} transacciones registradas
            </p>
          </CardContent>
        </Card>

        {/* Gastos Card */}
        <Card className="border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-900/60 backdrop-blur-sm shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Gastos de este Mes
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-500/10">
              <ArrowDownRight className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tight text-rose-600 dark:text-rose-400">
              {formatCLP(totalGastosEsteMes)}
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              {gastosEsteMes.length} transacciones registradas
            </p>
          </CardContent>
        </Card>

        {/* Alimentación Card */}
        <Card className="border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-900/60 backdrop-blur-sm shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Presupuesto Alimentación
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-500/10">
              <Utensils className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black tracking-tight text-amber-600 dark:text-amber-400">
                {porcentajeAlimentacion}%
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {formatCLPCompact(totalAlimentacion)} de {formatCLPCompact(montoPresupuestado)}
              </span>
            </div>
            <Progress value={Math.min(porcentajeAlimentacion, 100)} className="h-2" indicatorClassName={getProgressColor(porcentajeAlimentacion)} />
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Trend Chart */}
        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800 dark:text-white">Flujo de Caja Histórico</CardTitle>
            <CardDescription className="text-xs">
              Evolución de ingresos y gastos de los últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ultimosMeses} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="label" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value / 1000}K`}
                />
                <Tooltip
                  formatter={(value: any) => [formatCLP(Number(value)), ""]}
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Gastos" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expenses Pie Chart */}
        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800 dark:text-white">Distribución de Gastos</CardTitle>
            <CardDescription className="text-xs">
              Gastos clasificados por categoría este mes
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[280px] relative flex items-center justify-center">
            {expensesByCategoryData.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <Percent className="h-8 w-8 text-slate-300 dark:text-slate-700" />
                <span className="mt-2 text-xs text-slate-400">Sin gastos este mes</span>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensesByCategoryData}
                      cx="50%"
                      cy="40%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {expensesByCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [formatCLP(Number(value)), ""]}
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      wrapperStyle={{ fontSize: "11px", bottom: 0 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text overlay */}
                <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none pb-12">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Total Mes</span>
                  <span className="text-lg font-black text-slate-800 dark:text-white leading-tight">
                    {formatCLPCompact(totalGastosEsteMes)}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transactions and Food Quick look */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Transactions */}
        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-800 dark:text-white">Últimas Transacciones</CardTitle>
              <CardDescription className="text-xs">Actividad financiera más reciente</CardDescription>
            </div>
            <Button variant="ghost" size="sm" render={<Link href="/hogar/gastos" />} className="text-xs text-emerald-500 hover:text-emerald-600 gap-1">
              Ver todo <ArrowRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            {combinedTransactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No hay transacciones registradas.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                      <TableHead className="text-xs font-semibold">Descripción</TableHead>
                      <TableHead className="text-xs font-semibold">Fecha</TableHead>
                      <TableHead className="text-right text-xs font-semibold">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {combinedTransactions.map((tx: any) => {
                      const isInc = tx.type === "income"
                      return (
                        <TableRow key={tx.id + tx.type} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                          <TableCell className="py-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`flex h-2 w-2 rounded-full ${isInc ? "bg-emerald-500" : "bg-rose-500"
                                  }`}
                              />
                              <span className="font-medium text-xs text-slate-800 dark:text-slate-200">
                                {tx.descripcion}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-500 text-xs py-3">{formatDate(tx.fecha)}</TableCell>
                          <TableCell className={`text-right font-semibold text-xs py-3 ${isInc ? "text-emerald-500" : "text-rose-500"}`}>
                            {isInc ? "+" : "-"} {formatCLP(tx.monto)}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Food Quick Stats */}
        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-800 dark:text-white">Alimentación del Mes</CardTitle>
              <CardDescription className="text-xs">Gastos en supermercado, feria y otros</CardDescription>
            </div>
            <Button variant="ghost" size="sm" render={<Link href="/hogar/alimentacion" />} className="text-xs text-amber-500 hover:text-amber-600 gap-1">
              Configurar <ArrowRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center gap-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
                <span className="text-xs text-slate-400 block mb-1">Presupuestado</span>
                <span className="text-lg font-bold text-slate-800 dark:text-white">
                  {formatCLP(montoPresupuestado)}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
                <span className="text-xs text-slate-400 block mb-1">Total Gastado</span>
                <span className={`text-lg font-bold ${porcentajeAlimentacion >= 100 ? "text-rose-500" : "text-slate-800 dark:text-white"}`}>
                  {formatCLP(totalAlimentacion)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Progreso de consumo</span>
                <span className={`font-semibold ${porcentajeAlimentacion >= 100 ? "text-rose-500" : "text-slate-700 dark:text-slate-300"}`}>
                  {porcentajeAlimentacion}% consumido
                </span>
              </div>
              <Progress
                value={Math.min(porcentajeAlimentacion, 100)}
                className="h-3"
                indicatorClassName={getProgressColor(porcentajeAlimentacion)}
              />
              {porcentajeAlimentacion >= 100 && (
                <div className="p-2 text-center text-xs font-semibold text-rose-500 bg-rose-500/10 rounded-lg animate-pulse">
                  ¡Atención! Has excedido el presupuesto de alimentación de este mes.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expense Modal */}
      <Dialog open={isExpenseOpen} onOpenChange={setIsExpenseOpen}>
        <DialogContent className="border-slate-200 bg-white text-slate-850 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg">Registrar Nuevo Gasto</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Ingresa los detalles para registrar un gasto general del hogar.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddExpense}>
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="exp-desc" className="text-slate-600 dark:text-slate-300 text-xs font-semibold">Descripción *</Label>
                <Input
                  id="exp-desc"
                  placeholder="Ej: Pago de luz, Compras ferretería"
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  required
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="exp-monto" className="text-slate-600 dark:text-slate-300 text-xs font-semibold">Monto (CLP) *</Label>
                  <Input
                    id="exp-monto"
                    type="number"
                    placeholder="Ej: 35000"
                    value={expenseMonto}
                    onChange={(e) => setExpenseMonto(e.target.value)}
                    required
                    className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="exp-fecha" className="text-slate-600 dark:text-slate-300 text-xs font-semibold">Fecha *</Label>
                  <Input
                    id="exp-fecha"
                    type="date"
                    value={expenseFecha}
                    onChange={(e) => setExpenseFecha(e.target.value)}
                    required
                    className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="exp-cat" className="text-slate-600 dark:text-slate-300 text-xs font-semibold">Categoría</Label>
                  <Select value={expenseCategoria} onValueChange={setExpenseCategoria}>
                    <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                      <SelectItem value="null">Sin Categoría</SelectItem>
                      {initialCategorias.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                            {c.nombre}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="exp-metodo" className="text-slate-600 dark:text-slate-300 text-xs font-semibold">Método de Pago</Label>
                  <Select value={expenseMetodo} onValueChange={setExpenseMetodo}>
                    <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                      <SelectItem value="Efectivo">Efectivo</SelectItem>
                      <SelectItem value="Tarjeta de Débito">Tarjeta de Débito</SelectItem>
                      <SelectItem value="Tarjeta de Crédito">Tarjeta de Crédito</SelectItem>
                      <SelectItem value="Transferencia">Transferencia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsExpenseOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmittingExpense} className="bg-rose-600 text-white hover:bg-rose-500">
                {isSubmittingExpense ? "Guardando..." : "Registrar Gasto"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Income Modal */}
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
                <Label htmlFor="inc-desc" className="text-slate-600 dark:text-slate-300 text-xs font-semibold">Descripción *</Label>
                <Input
                  id="inc-desc"
                  placeholder="Ej: Sueldo mensual, Venta informal"
                  value={incomeDesc}
                  onChange={(e) => setIncomeDesc(e.target.value)}
                  required
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="inc-monto" className="text-slate-600 dark:text-slate-300 text-xs font-semibold">Monto (CLP) *</Label>
                  <Input
                    id="inc-monto"
                    type="number"
                    placeholder="Ej: 800000"
                    value={incomeMonto}
                    onChange={(e) => setIncomeMonto(e.target.value)}
                    required
                    className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="inc-fecha" className="text-slate-600 dark:text-slate-300 text-xs font-semibold">Fecha *</Label>
                  <Input
                    id="inc-fecha"
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
                  <Label htmlFor="inc-fuente" className="text-slate-600 dark:text-slate-300 text-xs font-semibold">Fuente / Empleador</Label>
                  <Input
                    id="inc-fuente"
                    placeholder="Ej: Empresa X, Particular"
                    value={incomeFuente}
                    onChange={(e) => setIncomeFuente(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div className="flex items-center gap-2 h-10 px-1">
                  <input
                    id="inc-recurrente"
                    type="checkbox"
                    checked={incomeRecurrente}
                    onChange={(e) => setIncomeRecurrente(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4 bg-slate-50 dark:bg-slate-950 dark:border-slate-800"
                  />
                  <Label htmlFor="inc-recurrente" className="text-slate-600 dark:text-slate-300 text-xs cursor-pointer select-none">
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
