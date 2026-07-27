"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatCLP, formatDate } from "@/lib/format"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
import {
  GraduationCap,
  TrendingUp,
  Receipt,
  ShoppingCart,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Info,
  ArrowDownRight,
  FileText,
} from "lucide-react"

type ColegioDashboardContentProps = {
  user: { name: string; email: string }
  pupils: any[]
  selectedAlumnoId: string
  pending: any[]
  paid: any[]
  metas: any[]
  egresos: any[]
}

export function ColegioDashboardContent({
  user,
  pupils,
  selectedAlumnoId,
  pending,
  paid,
  metas,
  egresos,
}: ColegioDashboardContentProps) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const selectedPupil = pupils.find((p) => p.id === selectedAlumnoId)

  const handleStudentChange = (id: string) => {
    setSelectedIds([])
    router.push(`/colegio/dashboard?alumnoId=${id}`)
  }

  // Calculations
  const totalPagado = paid.reduce((sum, c) => sum + c.monto, 0)
  const totalAdeudado = pending.reduce((sum, c) => sum + c.monto, 0)

  const toggleSelectCuota = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds((prev) => prev.filter((x) => x !== id))
    } else {
      setSelectedIds((prev) => [...prev, id])
    }
  }

  const handleGoToPay = () => {
    if (selectedIds.length === 0) {
      toast.error("Selecciona al menos una cuota para pagar")
      return
    }
    const idsString = selectedIds.join(",")
    router.push(`/colegio/pagar?alumnoId=${selectedAlumnoId}&ids=${idsString}`)
  }

  // Detect if a date is overdue
  const isOverdue = (dateStr: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dueDate = new Date(dateStr)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate < today
  }

  return (
    <div className="space-y-8 animate-fade-in text-xs">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
            Portal Escolar Apoderado
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Control de cuotas de tus pupilos, metas del curso y rendición de cuentas.
          </p>
        </div>

        {/* Student Selector */}
        {pupils.length > 0 && (
          <div className="flex items-center gap-2">
            <Label htmlFor="stud-sel" className="font-semibold text-xs whitespace-nowrap">Alumno Seleccionado:</Label>
            <select
              id="stud-sel"
              value={selectedAlumnoId}
              onChange={(e) => handleStudentChange(e.target.value)}
              className="rounded-md border border-slate-200 bg-white p-2 text-xs font-bold text-indigo-600 outline-none dark:border-slate-800 dark:bg-slate-900 min-w-[200px]"
            >
              {pupils.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombreCompleto} ({p.cursoNivel} {p.cursoNombre})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {pupils.length === 0 ? (
        <Card className="border-dashed border-slate-300 dark:border-slate-800 p-12 text-center">
          <GraduationCap className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-350">Sin alumnos vinculados</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Tu perfil de apoderado no tiene estudiantes asociados. Solicita al webmaster que te vincule en la administración.
          </p>
        </Card>
      ) : (
        <>
          {/* Quick stats cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-900/60 shadow-xs">
              <CardHeader className="pb-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Estudiante</span>
              </CardHeader>
              <CardContent>
                <div className="text-base font-black text-slate-800 dark:text-white truncate">{selectedPupil?.nombreCompleto}</div>
                <p className="text-[10px] text-indigo-500 font-bold mt-0.5">{selectedPupil?.colegioNombre} — {selectedPupil?.cursoNivel} {selectedPupil?.cursoNombre}</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-900/60 shadow-xs">
              <CardHeader className="pb-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Adeudado Pendiente</span>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-black text-rose-500">{formatCLP(totalAdeudado)}</div>
                <p className="text-[10px] text-slate-400 mt-1">{pending.length} cuotas activas</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-900/60 shadow-xs">
              <CardHeader className="pb-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Aportado / Pagado</span>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{formatCLP(totalPagado)}</div>
                <p className="text-[10px] text-slate-400 mt-1">{paid.length} recibos guardados</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Left Column: Fees and Shopping Cart */}
            <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col justify-between">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-indigo-500" />
                    Carro de Cuotas Pendientes
                  </CardTitle>
                  <CardDescription className="text-xs">Selecciona las cuotas escolares a pagar</CardDescription>
                </div>
                {selectedIds.length > 0 && (
                  <Badge className="bg-indigo-600 text-white font-bold">{selectedIds.length} seleccionadas</Badge>
                )}
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col justify-between">
                {pending.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 flex-1 flex flex-col justify-center">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                    ¡Sin cuotas pendientes! Estás al día con el curso.
                  </div>
                ) : (
                  <>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[300px] overflow-y-auto">
                      {pending.map((c) => {
                        const isC_Overdue = isOverdue(c.fechaVencimiento)
                        return (
                          <div
                            key={c.id}
                            onClick={() => toggleSelectCuota(c.id)}
                            className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${selectedIds.includes(c.id)
                              ? "bg-indigo-50/55 dark:bg-indigo-950/20"
                              : "hover:bg-slate-50/50 dark:hover:bg-slate-900/30"
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(c.id)}
                                onChange={() => { }} // handled by click
                                className="h-4 w-4 rounded-sm text-indigo-600 border-slate-300 dark:border-slate-700"
                              />
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                  {c.nombre}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  Vence: {formatDate(c.fechaVencimiento)}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col items-end">
                              <strong className="text-xs text-slate-850 dark:text-slate-200">{formatCLP(c.monto)}</strong>
                              {isC_Overdue ? (
                                <span className="text-[9px] font-bold uppercase text-rose-500 flex items-center gap-0.5">
                                  <AlertTriangle className="h-3 w-3" /> Vencido
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold uppercase text-amber-500">Pendiente</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/55 dark:bg-slate-950/20">
                      <Button
                        onClick={handleGoToPay}
                        disabled={selectedIds.length === 0}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2"
                      >
                        Pagar Selección ({formatCLP(pending.filter((c) => selectedIds.includes(c.id)).reduce((sum, c) => sum + c.monto, 0))})
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Right Column: Metas Avance */}
            <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col justify-between">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/85">
                <CardTitle className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-indigo-500" />
                  Metas del Curso
                </CardTitle>
                <CardDescription className="text-xs">Fondo colectivo y avance de metas para paseos y eventos</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 flex-1 flex flex-col justify-start">
                {metas.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-12">No hay metas colectivas activas registradas para este curso.</p>
                ) : (
                  <div className="space-y-6">
                    {metas.map((m) => {
                      const percent = m.objetivo > 0 ? Math.round((m.recaudado / m.objetivo) * 100) : 0
                      return (
                        <div key={m.id} className="space-y-2 border border-slate-100 dark:border-slate-800 p-3 rounded-xl bg-slate-50/60 dark:bg-slate-950/20">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{m.nombre}</span>
                            <Badge className="bg-indigo-500/10 text-indigo-500 border-0 text-[9px] font-bold">{percent}%</Badge>
                          </div>
                          {m.descripcion && <p className="text-[10px] text-slate-400 leading-normal">{m.descripcion}</p>}
                          <Progress value={Math.min(percent, 100)} className="h-2" indicatorClassName="bg-indigo-500" />
                          <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
                            <span>Recaudado: <strong className="text-emerald-500 font-extrabold">{formatCLP(m.recaudado)}</strong></span>
                            <span>Meta: <strong>{formatCLP(m.objetivo)}</strong></span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Transparency / Egresos Curso Card */}
            <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col justify-between">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
                <CardTitle className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <ArrowDownRight className="h-5 w-5 text-rose-500" />
                  Rendición de Cuentas (Egresos Curso)
                </CardTitle>
                <CardDescription className="text-xs">Consulta en qué actividades e inversiones se gastó el dinero recaudado</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 flex-1 flex flex-col justify-start">
                {egresos.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-12">La directiva no ha registrado egresos o inversiones en este curso.</p>
                ) : (
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                    {egresos.map((eg) => (
                      <div key={eg.id} className="space-y-1.5 border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-950/20">
                        <div className="flex justify-between items-center text-[11px] font-bold">
                          <span className="text-slate-700 dark:text-slate-200">{eg.descripcion}</span>
                          <span className="text-rose-500">{formatCLP(eg.monto)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[9px] text-slate-400">
                          <span>Fecha: {formatDate(eg.fecha)}</span>
                          {eg.comprobanteUrl && (
                            <Badge
                              variant="outline"
                              onClick={() => toast.info(`Simulación: Visualizando boleta ${eg.comprobanteUrl}`)}
                              className="cursor-pointer text-[8px] font-semibold border-indigo-500/20 bg-indigo-500/10 text-indigo-500 flex items-center gap-0.5"
                            >
                              <FileText className="h-2.5 w-2.5" /> Boleta/Factura
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Paid Receipts */}
            <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col justify-between">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
                <CardTitle className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-indigo-500" />
                  Boletas y Recibos Pagados
                </CardTitle>
                <CardDescription className="text-xs">Registro histórico de transacciones del alumno seleccionado</CardDescription>
              </CardHeader>
              <CardContent className="p-0 flex-1">
                {paid.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No hay comprobantes de pago registrados para este alumno.
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-[300px]">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                          <TableHead className="text-xs font-semibold pl-6">Cuota</TableHead>
                          <TableHead className="text-xs font-semibold">Fecha Pago</TableHead>
                          <TableHead className="text-xs font-semibold">ID Transacción</TableHead>
                          <TableHead className="text-right text-xs font-semibold pr-6">Monto</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paid.map((comp) => (
                          <TableRow key={comp.id} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                            <TableCell className="font-semibold text-xs py-3 pl-6 text-slate-800 dark:text-slate-200">{comp.cuotaNombre}</TableCell>
                            <TableCell className="text-slate-500 text-xs py-3">{formatDate(comp.fecha)}</TableCell>
                            <TableCell className="text-slate-500 text-xs py-3 font-mono text-[9px]">{comp.transaccionId.slice(0, 15)}...</TableCell>
                            <TableCell className="text-right font-bold text-xs py-3 text-emerald-500 pr-6">{formatCLP(comp.monto)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
