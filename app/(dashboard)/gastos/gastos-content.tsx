"use client"

import * as React from "react"
import { useState } from "react"
import { formatCLP, formatDate } from "@/lib/format"
import {
  createGasto,
  updateGasto,
  deleteGasto,
  createCategoria,
  deleteCategoria,
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
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Plus, Trash2, Filter, Tags, ArrowDownRight, Edit } from "lucide-react"

type GastosContentProps = {
  initialGastos: any[]
  initialCategorias: any[]
}

const PRESET_COLORS = [
  "#ef4444", // rojo
  "#f97316", // naranja
  "#f59e0b", // amarillo
  "#10b981", // verde
  "#06b6d4", // celeste
  "#3b82f6", // azul
  "#6366f1", // indigo
  "#8b5cf6", // violeta
  "#ec4899", // rosa
  "#64748b", // slate/gris
]

export function GastosContent({
  initialGastos,
  initialCategorias,
}: GastosContentProps) {
  const [gastos, setGastos] = useState(initialGastos.map((g) => ({ ...g, fecha: (g as any).fecha || g.fechaInicio } as any)))
  const [categorias, setCategorias] = useState(initialCategorias)

  // Modals and form states
  const [isExpenseOpen, setIsExpenseOpen] = useState(false)
  const [expenseDesc, setExpenseDesc] = useState("")
  const [expenseMonto, setExpenseMonto] = useState("")
  const [expenseFecha, setExpenseFecha] = useState(
    new Date().toISOString().substring(0, 10)
  )
  const [expenseCategoria, setExpenseCategoria] = useState("null")
  const [expenseMetodo, setExpenseMetodo] = useState("Efectivo")
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false)
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null)

  // Category form states
  const [newCatName, setNewCatName] = useState("")
  const [newCatColor, setNewCatColor] = useState(PRESET_COLORS[0])
  const [isSubmittingCat, setIsSubmittingCat] = useState(false)

  // Filter states
  const [filterCategory, setFilterCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Filtered Gastos
  const filteredGastos = gastos.filter((g) => {
    const matchesCategory =
      filterCategory === "all" ||
      (filterCategory === "null" && g.categoriaId === null) ||
      String(g.categoriaId) === filterCategory

    const matchesSearch =
      g.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.metodoPago && g.metodoPago.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesCategory && matchesSearch
  })

  // Start Edit Handler
  const handleStartEditExpense = (g: any) => {
    setEditingExpenseId(g.id)
    setExpenseDesc(g.descripcion)
    setExpenseMonto(String(g.monto))
    setExpenseFecha(g.fecha || g.fechaInicio)
    setExpenseCategoria(g.categoriaId ? String(g.categoriaId) : "null")
    setExpenseMetodo(g.metodoPago || "Efectivo")
    setIsExpenseOpen(true)
  }

  // Submit handers
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!expenseDesc || !expenseMonto || !expenseFecha) {
      toast.error("Por favor completa los campos requeridos")
      return
    }

    setIsSubmittingExpense(true)
    try {
      if (editingExpenseId) {
        const updated = await updateGasto(editingExpenseId, {
          descripcion: expenseDesc,
          monto: Number(expenseMonto),
          fecha: expenseFecha,
          categoriaId: expenseCategoria === "null" ? null : Number(expenseCategoria),
          metodoPago: expenseMetodo,
        })

        setGastos((prev) =>
          prev.map((g) => (g.id === editingExpenseId ? { ...updated, fecha: (updated as any).fecha || updated.fechaInicio } as any : g))
        )
        setIsExpenseOpen(false)
        setEditingExpenseId(null)
        setExpenseDesc("")
        setExpenseMonto("")
        setExpenseCategoria("null")
        setExpenseMetodo("Efectivo")
        toast.success("Gasto actualizado correctamente")
      } else {
        const newG = await createGasto({
          descripcion: expenseDesc,
          monto: Number(expenseMonto),
          fecha: expenseFecha,
          categoriaId: expenseCategoria === "null" ? null : Number(expenseCategoria),
          metodoPago: expenseMetodo,
        })

        setGastos((prev) => [{ ...(newG as any), fecha: (newG as any).fecha || (newG as any).fechaInicio } as any, ...prev])
        setIsExpenseOpen(false)
        setExpenseDesc("")
        setExpenseMonto("")
        setExpenseCategoria("null")
        setExpenseMetodo("Efectivo")
        toast.success("Gasto registrado correctamente")
      }
    } catch (err: any) {
      toast.error(err.message || "Error al procesar el gasto")
    } finally {
      setIsSubmittingExpense(false)
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName.trim()) {
      toast.error("El nombre de la categoría es obligatorio")
      return
    }

    setIsSubmittingCat(true)
    try {
      const newC = await createCategoria(newCatName, newCatColor)
      setCategorias((prev) => [newC, ...prev])
      setNewCatName("")
      toast.success("Categoría creada con éxito")
    } catch (err: any) {
      toast.error(err.message || "Error al crear la categoría")
    } finally {
      setIsSubmittingCat(false)
    }
  }

  const handleDeleteExpense = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este gasto?")) return

    try {
      await deleteGasto(id)
      setGastos((prev) => prev.filter((g) => g.id !== id))
      toast.success("Gasto eliminado correctamente")
    } catch (err: any) {
      toast.error("Error al eliminar el gasto")
    }
  }

  const handleDeleteCategory = async (id: number) => {
    if (
      !confirm(
        "¿Estás seguro de que deseas eliminar esta categoría? Los gastos asociados no se eliminarán, solo perderán su categoría."
      )
    )
      return

    try {
      await deleteCategoria(id)
      setCategorias((prev) => prev.filter((c) => c.id !== id))
      // Update local expenses to remove deleted category
      setGastos((prev) =>
        prev.map((g) => (g.categoriaId === id ? { ...g, categoriaId: null } : g))
      )
      toast.success("Categoría eliminada correctamente")
    } catch (err: any) {
      toast.error("Error al eliminar la categoría")
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Gastos del Hogar
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Administra los egresos generales y las categorías de gastos del hogar
          </p>
        </div>
        <div>
          <Button
            onClick={() => {
              setEditingExpenseId(null)
              setExpenseDesc("")
              setExpenseMonto("")
              setExpenseCategoria("null")
              setExpenseMetodo("Efectivo")
              setIsExpenseOpen(true)
            }}
            className="bg-rose-600 hover:bg-rose-500 text-white font-medium flex items-center gap-2 shadow-lg shadow-rose-600/10"
          >
            <Plus className="h-4 w-4" /> Registrar Gasto
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Expenses List Column */}
        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:col-span-2 shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <CardTitle className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <ArrowDownRight className="h-5 w-5 text-rose-500" />
              Historial de Gastos
            </CardTitle>
            <CardDescription className="text-xs">
              Egresos familiares ordenados por fecha
            </CardDescription>

            {/* Filter Tools */}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Input
                  placeholder="Buscar por descripción..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs"
                />
              </div>
              <div className="w-full sm:w-[180px]">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <SelectItem value="all">Todas las Categorías</SelectItem>
                    <SelectItem value="null">Sin Categoría</SelectItem>
                    {categorias.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredGastos.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400">
                No se encontraron gastos que coincidan con los filtros.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                      <TableHead className="text-xs font-semibold pl-6">Descripción</TableHead>
                      <TableHead className="text-xs font-semibold">Categoría</TableHead>
                      <TableHead className="text-xs font-semibold">Fecha</TableHead>
                      <TableHead className="text-xs font-semibold">Pago</TableHead>
                      <TableHead className="text-right text-xs font-semibold">Monto</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGastos.map((g) => {
                      const cat = categorias.find((c) => c.id === g.categoriaId)
                      return (
                        <TableRow
                          key={g.id}
                          className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/30"
                        >
                          <TableCell className="font-semibold text-xs py-4 pl-6 text-slate-800 dark:text-slate-200">
                            {g.descripcion}
                          </TableCell>
                          <TableCell className="py-4">
                            {cat ? (
                              <Badge
                                variant="outline"
                                className="text-[10px] font-semibold border-slate-200 dark:border-slate-800 flex items-center gap-1.5 w-fit"
                              >
                                <span
                                  className="h-2 w-2 rounded-full"
                                  style={{ backgroundColor: cat.color }}
                                />
                                {cat.nombre}
                              </Badge>
                            ) : (
                              <span className="text-[10px] text-slate-400">Sin Categoría</span>
                            )}
                          </TableCell>
                          <TableCell className="text-slate-500 text-xs py-4">
                            {formatDate(g.fecha)}
                          </TableCell>
                          <TableCell className="text-slate-500 text-xs py-4">
                            {g.metodoPago || "Efectivo"}
                          </TableCell>
                          <TableCell className="text-right font-bold text-xs py-4 text-rose-500">
                            {formatCLP(g.monto)}
                          </TableCell>
                          <TableCell className="pr-6 py-4 flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleStartEditExpense(g)}
                              className="text-indigo-500 hover:text-indigo-650 hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
                              title="Editar gasto"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleDeleteExpense(g.id)}
                              className="text-rose-500 hover:text-rose-650 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                              title="Eliminar gasto"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
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

        {/* Categories Manager Column */}
        <div className="space-y-6">
          {/* Custom Categories Card */}
          <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <CardTitle className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Tags className="h-5 w-5 text-emerald-500" />
                Categorías Personalizadas
              </CardTitle>
              <CardDescription className="text-xs">
                Administra las clasificaciones de gastos del hogar
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Category form */}
              <form onSubmit={handleAddCategory} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="cat-name" className="text-xs font-semibold text-slate-500">Nueva Categoría *</Label>
                  <Input
                    id="cat-name"
                    placeholder="Ej: Mascotas, Regalos"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    required
                    className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-500">Color distintivo</Label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setNewCatColor(col)}
                        className={`h-6 w-6 rounded-full border border-white dark:border-slate-950 transition-transform ${
                          newCatColor === col ? "scale-125 ring-2 ring-emerald-500" : "opacity-80 hover:opacity-100"
                        }`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                    {/* Custom Color Input */}
                    <div className="relative h-6 w-6 rounded-full overflow-hidden border border-slate-200">
                      <input
                        type="color"
                        value={newCatColor}
                        onChange={(e) => setNewCatColor(e.target.value)}
                        className="absolute inset-0 h-full w-full p-0 cursor-pointer border-0 rounded-full scale-150"
                      />
                    </div>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isSubmittingCat}
                  className="w-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-xs font-semibold"
                >
                  {isSubmittingCat ? "Creando..." : "Crear Categoría"}
                </Button>
              </form>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <span className="text-xs font-semibold text-slate-500 block mb-3">Categorías Creadas</span>
                {categorias.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No tienes categorías personalizadas.</p>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto">
                    {categorias.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: c.color }}
                          />
                          <span className="font-medium text-slate-800 dark:text-slate-200">{c.nombre}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleDeleteCategory(c.id)}
                          className="text-slate-400 hover:text-rose-500"
                          title="Eliminar categoría"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Expense Dialog Modal */}
      <Dialog open={isExpenseOpen} onOpenChange={setIsExpenseOpen}>
        <DialogContent className="border-slate-200 bg-white text-slate-850 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg">
              {editingExpenseId ? "Editar Gasto" : "Registrar Nuevo Gasto"}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              {editingExpenseId ? "Modifica los detalles del gasto seleccionado." : "Ingresa los detalles para registrar un gasto general del hogar."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddExpense}>
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="dlg-exp-desc" className="text-slate-600 dark:text-slate-300 text-xs font-semibold">Descripción *</Label>
                <Input
                  id="dlg-exp-desc"
                  placeholder="Ej: Pago de luz, Compras ferretería"
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  required
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="dlg-exp-monto" className="text-slate-600 dark:text-slate-300 text-xs font-semibold">Monto (CLP) *</Label>
                  <Input
                    id="dlg-exp-monto"
                    type="number"
                    placeholder="Ej: 35000"
                    value={expenseMonto}
                    onChange={(e) => setExpenseMonto(e.target.value)}
                    required
                    className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dlg-exp-fecha" className="text-slate-600 dark:text-slate-300 text-xs font-semibold">Fecha *</Label>
                  <Input
                    id="dlg-exp-fecha"
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
                  <Label htmlFor="dlg-exp-cat" className="text-slate-600 dark:text-slate-300 text-xs font-semibold">Categoría</Label>
                  <Select value={expenseCategoria} onValueChange={setExpenseCategoria}>
                    <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                      <SelectItem value="null">Sin Categoría</SelectItem>
                      {categorias.map((c) => (
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
                  <Label htmlFor="dlg-exp-metodo" className="text-slate-600 dark:text-slate-300 text-xs font-semibold">Método de Pago</Label>
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
    </div>
  )
}
