"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { emitirGastosComunes, createGastoCondominio } from "@/lib/actions-condo"
import { formatCLP, formatDate, MESES } from "@/lib/format"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Plus, DollarSign, Wallet, ArrowDownRight, Megaphone } from "lucide-react"

type GastosComunesContentProps = {
  initialGastosComunes: any[]
  initialEgresosCondo: any[]
}

const CATEGORIAS_EGRESO = [
  "Conserjería y Personal",
  "Mantenimiento Ascensores",
  "Servicios Básicos Comunes",
  "Seguridad y Cámaras",
  "Áreas Verdes / Piscina",
  "Administración y Seguros",
  "Otros Egresos",
]

export function GastosComunesContent({
  initialGastosComunes,
  initialEgresosCondo,
}: GastosComunesContentProps) {
  const router = useRouter()
  const [gastosComunesList, setGastosComunesList] = useState(initialGastosComunes)
  const [egresosCondo, setEgresosCondo] = useState(initialEgresosCondo)

  const [isEmitOpen, setIsEmitOpen] = useState(false)
  const [isEgresoOpen, setIsEgresoOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Emit Form
  const [emitMes, setEmitMes] = useState(String(new Date().getMonth() + 1))
  const [emitAnio, setEmitAnio] = useState(String(new Date().getFullYear()))
  const [emitMontoBase, setEmitMontoBase] = useState("")
  const [emitVencimiento, setEmitVencimiento] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 5).toISOString().substring(0, 10)
  )

  // Egreso Form
  const [egresoDesc, setEgresoDesc] = useState("")
  const [egresoMonto, setEgresoMonto] = useState("")
  const [egresoFecha, setEgresoFecha] = useState(new Date().toISOString().substring(0, 10))
  const [egresoCat, setEgresoCat] = useState("Conserjería y Personal")
  const [egresoObs, setEgresoObs] = useState("")

  const handleOpenEmit = () => {
    setEmitMes(String(new Date().getMonth() + 1))
    setEmitAnio(String(new Date().getFullYear()))
    setEmitMontoBase("")
    setIsEmitOpen(true)
  }

  const handleOpenEgreso = () => {
    setEgresoDesc("")
    setEgresoMonto("")
    setEgresoFecha(new Date().toISOString().substring(0, 10))
    setEgresoCat("Conserjería y Personal")
    setEgresoObs("")
    setIsEgresoOpen(true)
  }

  const handleSaveEmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emitMontoBase || Number(emitMontoBase) <= 0 || !emitVencimiento) {
      toast.error("Por favor ingresa un monto base y fecha de vencimiento válidos")
      return
    }

    setIsSubmitting(true)
    try {
      await emitirGastosComunes({
        mes: Number(emitMes),
        anio: Number(emitAnio),
        montoBase: Number(emitMontoBase),
        fechaVencimiento: emitVencimiento,
      })
      toast.success("Gastos comunes mensuales emitidos y prorrateados correctamente")
      setIsEmitOpen(false)
      router.refresh()
      window.location.reload()
    } catch (err: any) {
      toast.error(err.message || "Error al emitir los gastos comunes")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveEgreso = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!egresoDesc.trim() || !egresoMonto || !egresoFecha) {
      toast.error("Por favor completa los campos requeridos")
      return
    }

    setIsSubmitting(true)
    try {
      const newExp = await createGastoCondominio({
        descripcion: egresoDesc.trim(),
        monto: Number(egresoMonto),
        fecha: egresoFecha,
        categoria: egresoCat,
        observaciones: egresoObs,
      })
      setEgresosCondo((prev) => [newExp, ...prev])
      toast.success("Egreso de condominio registrado con éxito")
      setIsEgresoOpen(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Error al registrar el egreso")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
            Gastos Comunes y Egresos
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Control de cobros mensuales a residentes y contabilidad de egresos del condominio
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleOpenEmit} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5">
            <Megaphone className="h-4 w-4" /> Emitir Gasto Común
          </Button>
          <Button onClick={handleOpenEgreso} className="bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Registrar Egreso Condominio
          </Button>
        </div>
      </div>

      <Tabs defaultValue="gastos-comunes" className="w-full">
        <TabsList className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 mb-4 flex w-fit">
          <TabsTrigger value="gastos-comunes" className="px-4 py-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 font-bold text-slate-700 dark:text-slate-200">
            Gastos Comunes Emitidos
          </TabsTrigger>
          <TabsTrigger value="egresos-condo" className="px-4 py-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 font-bold text-slate-700 dark:text-slate-200">
            Egresos del Edificio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gastos-comunes">
          <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <CardTitle className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-indigo-500" />
                Cobros Mensuales Emitidos
              </CardTitle>
              <CardDescription className="text-xs">Gastos comunes prorrateados por alícuota de copropiedad</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {gastosComunesList.length === 0 ? (
                <div className="py-16 text-center text-slate-400">No hay cobros de gastos comunes registrados.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                        <TableHead className="text-xs font-semibold pl-6">Departamento</TableHead>
                        <TableHead className="text-xs font-semibold">Copropietario</TableHead>
                        <TableHead className="text-xs font-semibold">Periodo</TableHead>
                        <TableHead className="text-xs font-semibold">Vencimiento</TableHead>
                        <TableHead className="text-xs font-semibold">Estado</TableHead>
                        <TableHead className="text-right text-xs font-semibold pr-6">Monto Cobrado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gastosComunesList.map((gc) => (
                        <TableRow key={gc.id} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                          <TableCell className="font-extrabold text-xs py-3.5 pl-6 text-indigo-500">
                            {gc.bloque ? `${gc.bloque} - N° ${gc.numero}` : `N° ${gc.numero}`}
                          </TableCell>
                          <TableCell className="font-semibold text-xs py-3.5 text-slate-700 dark:text-slate-350">{gc.copropietarioNombre || "Sin asignar"}</TableCell>
                          <TableCell className="text-slate-500 py-3.5">{MESES[gc.mes - 1]} / {gc.anio}</TableCell>
                          <TableCell className="text-slate-500 py-3.5">{formatDate(gc.fechaVencimiento)}</TableCell>
                          <TableCell className="py-3.5">
                            <Badge variant="outline" className={`text-[9px] font-bold border-0 ${
                              gc.estado === "pagado"
                                ? "bg-emerald-500/10 text-emerald-500"
                                : "bg-rose-500/10 text-rose-500"
                            }`}>
                              {gc.estado}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-bold text-xs py-3.5 text-slate-850 dark:text-slate-200 pr-6">{formatCLP(gc.monto)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="egresos-condo">
          <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <CardTitle className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <ArrowDownRight className="h-5 w-5 text-rose-500" />
                Detalle de Egresos / Gastos del Condominio
              </CardTitle>
              <CardDescription className="text-xs">Gastos globales incurridos en la mantención del edificio</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {egresosCondo.length === 0 ? (
                <div className="py-16 text-center text-slate-400">No hay egresos de condominio registrados.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                        <TableHead className="text-xs font-semibold pl-6">Descripción del Gasto</TableHead>
                        <TableHead className="text-xs font-semibold">Categoría</TableHead>
                        <TableHead className="text-xs font-semibold">Fecha Registro</TableHead>
                        <TableHead className="text-xs font-semibold">Observaciones</TableHead>
                        <TableHead className="text-right text-xs font-semibold pr-6">Monto Gasto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {egresosCondo.map((eg) => (
                        <TableRow key={eg.id} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                          <TableCell className="font-semibold text-xs py-4 pl-6 text-slate-850 dark:text-slate-200">{eg.descripcion}</TableCell>
                          <TableCell className="py-4">
                            <Badge variant="outline" className="text-[10px] font-semibold border-slate-200 dark:border-slate-800">{eg.categoria}</Badge>
                          </TableCell>
                          <TableCell className="text-slate-500 py-4">{formatDate(eg.fecha)}</TableCell>
                          <TableCell className="text-slate-450 py-4 max-w-[200px] truncate">{eg.observaciones || "-"}</TableCell>
                          <TableCell className="text-right font-bold text-xs py-4 text-rose-500 pr-6">{formatCLP(eg.monto)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* EMIT DIALOG */}
      <Dialog open={isEmitOpen} onOpenChange={setIsEmitOpen}>
        <DialogContent className="border-slate-200 bg-white text-slate-850 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 text-xs">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg">Emitir Gasto Común Mensual</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Ingresa el gasto total del condominio a prorratear entre todas las unidades.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="emit-mes" className="font-semibold">Mes de Emisión *</Label>
                  <select id="emit-mes" value={emitMes} onChange={(e) => setEmitMes(e.target.value)} required className="w-full rounded-md border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                    {MESES.map((n, i) => (<option key={i + 1} value={i + 1}>{n}</option>))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="emit-anio" className="font-semibold">Año *</Label>
                  <Input id="emit-anio" type="number" value={emitAnio} onChange={(e) => setEmitAnio(e.target.value)} required className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="emit-base" className="font-semibold">Monto Total a Prorratear (CLP) *</Label>
                  <Input id="emit-base" type="number" placeholder="Ej: 5000000" value={emitMontoBase} onChange={(e) => setEmitMontoBase(e.target.value)} required className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="emit-venc" className="font-semibold">Fecha Vencimiento *</Label>
                  <Input id="emit-venc" type="date" value={emitVencimiento} onChange={(e) => setEmitVencimiento(e.target.value)} required className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsEmitOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 text-white font-semibold">{isSubmitting ? "Emitiendo..." : "Iniciar Emisión"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EGRESO DIALOG */}
      <Dialog open={isEgresoOpen} onOpenChange={setIsEgresoOpen}>
        <DialogContent className="border-slate-200 bg-white text-slate-850 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 text-xs">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg">Registrar Egreso de Condominio</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">Registra un egreso general incurrido por la administración del edificio.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEgreso}>
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="egr-desc" className="font-semibold">Descripción del Egreso *</Label>
                <Input id="egr-desc" placeholder="Ej: Pago servicio conserjería Julio, Mantención bombas agua" value={egresoDesc} onChange={(e) => setEgresoDesc(e.target.value)} required className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="egr-monto" className="font-semibold">Monto del Gasto (CLP) *</Label>
                  <Input id="egr-monto" type="number" placeholder="Ej: 850000" value={egresoMonto} onChange={(e) => setEgresoMonto(e.target.value)} required className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="egr-fecha" className="font-semibold">Fecha Registro *</Label>
                  <Input id="egr-fecha" type="date" value={egresoFecha} onChange={(e) => setEgresoFecha(e.target.value)} required className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="egr-cat" className="font-semibold">Categoría Gasto *</Label>
                  <select id="egr-cat" value={egresoCat} onChange={(e) => setEgresoCat(e.target.value)} required className="w-full rounded-md border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                    {CATEGORIAS_EGRESO.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="egr-obs" className="font-semibold">Observaciones / Nro Documento</Label>
                  <Input id="egr-obs" placeholder="Ej: Boleta N° 4301" value={egresoObs} onChange={(e) => setEgresoObs(e.target.value)} className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsEgresoOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-rose-600 text-white font-semibold">{isSubmitting ? "Registrando..." : "Registrar Egreso"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
